import crypto from 'crypto';
import { prisma } from '../prisma';
import { waConfig } from './config';
import { normalizePhone, maskPhone } from './phone';
import { waClient } from './client';
import { TEMPLATES } from './templates';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_HOURLY_SENDS = 5;

export function hashOtp(code: string): string {
  const salt = waConfig.appSecret || 'conduit_otp_salt_secret';
  return crypto.createHmac('sha256', salt).update(code.trim()).digest('hex');
}

export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export interface RequestOtpResult {
  success: boolean;
  message: string;
  contactId: string;
  cooldownSeconds: number;
}

export interface VerifyOtpResult {
  success: boolean;
  message: string;
  contactId: string;
  phoneE164: string;
}

/**
 * Validates cooldown and hourly quotas, creates a hashed OTP, and delivers it via WhatsApp.
 */
export async function requestPhoneOtp(
  rawPhone: string,
  userId?: string,
  ipAddress?: string
): Promise<RequestOtpResult> {
  const normalized = normalizePhone(rawPhone);
  if (!normalized.isValid) {
    throw new Error(normalized.error || 'Invalid phone number format');
  }

  // 1. Find or create the WhatsApp contact
  let contact = await prisma.whatsappContact.findUnique({
    where: { phoneE164: normalized.e164 },
  });

  if (!contact) {
    contact = await prisma.whatsappContact.create({
      data: {
        userId: userId || null,
        phoneE164: normalized.e164,
        preferences: JSON.stringify({
          newMatch: true,
          trustRequest: true,
          nodeVerified: true,
          intentUpdate: true,
          weeklyDigest: true,
        }),
      },
    });
  } else if (userId && !contact.userId) {
    contact = await prisma.whatsappContact.update({
      where: { id: contact.id },
      data: { userId },
    });
  }

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const sixtySecondsAgo = new Date(now.getTime() - RESEND_COOLDOWN_SECONDS * 1000);

  // 2. Enforce 60s resend cooldown per number
  const recentOtp = await prisma.whatsappOtp.findFirst({
    where: {
      contactId: contact.id,
      createdAt: { gte: sixtySecondsAgo },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((now.getTime() - recentOtp.createdAt.getTime()) / 1000);
    const remaining = Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 1);
    throw new Error(`Please wait ${remaining} seconds before requesting another code.`);
  }

  // 3. Enforce max 5 sends per hour per number
  const hourlyCountContact = await prisma.whatsappOtp.count({
    where: {
      contactId: contact.id,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (hourlyCountContact >= MAX_HOURLY_SENDS) {
    throw new Error('Hourly verification attempt limit reached for this number. Please try again in an hour.');
  }

  // 4. Enforce max 5 sends per hour per IP (if provided)
  if (ipAddress) {
    const hourlyCountIp = await prisma.whatsappOtp.count({
      where: {
        ipAddress,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (hourlyCountIp >= MAX_HOURLY_SENDS) {
      throw new Error('Hourly verification attempt limit reached for your connection. Please try again later.');
    }
  }

  // 5. Generate and hash OTP
  const rawOtpCode = generateSecureOtp();
  const codeHash = hashOtp(rawOtpCode);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.whatsappOtp.create({
    data: {
      contactId: contact.id,
      codeHash,
      expiresAt,
      ipAddress: ipAddress || null,
      attempts: 0,
    },
  });

  // 6. Deliver OTP via Meta Cloud API using conduit_otp template
  try {
    const templateDef = TEMPLATES.conduit_otp;
    const components = templateDef.buildComponents({ code: rawOtpCode });

    await waClient.sendTemplate(
      normalized.e164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  } catch (deliveryError: any) {
    console.warn(
      `[WhatsApp OTP Delivery Warning] Meta template conduit_otp failed (${deliveryError.message}). Attempting free-form text or dev fallback.`
    );
    // In dev / test or when template is pending approval, send as text fallback if within window
    try {
      await waClient.sendText(
        normalized.e164,
        `Your CONDUIT verification code is ${rawOtpCode}. Valid for 10 minutes.`,
        { contactId: contact.id }
      );
    } catch {
      // Allow local development and testing to log code safely when mock Meta token is active
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\x1b[32m[DEV ONLY] WhatsApp OTP for ${maskPhone(normalized.e164)}: ${rawOtpCode}\x1b[0m`);
      } else {
        throw deliveryError;
      }
    }
  }

  return {
    success: true,
    message: `Verification code sent to ${maskPhone(normalized.e164)}`,
    contactId: contact.id,
    cooldownSeconds: RESEND_COOLDOWN_SECONDS,
  };
}

/**
 * Validates a submitted 6-digit OTP code against the latest pending OTP record.
 */
export async function verifyPhoneOtp(
  rawPhone: string,
  submittedCode: string,
  userId?: string
): Promise<VerifyOtpResult> {
  const normalized = normalizePhone(rawPhone);
  if (!normalized.isValid) {
    throw new Error('Invalid phone number format');
  }

  const cleanCode = submittedCode.trim();
  if (!/^\d{6}$/.test(cleanCode)) {
    throw new Error('Verification code must be exactly 6 numeric digits');
  }

  const contact = await prisma.whatsappContact.findUnique({
    where: { phoneE164: normalized.e164 },
  });

  if (!contact) {
    throw new Error('No verification session found for this phone number. Please request a code first.');
  }

  // Find latest active OTP
  const latestOtp = await prisma.whatsappOtp.findFirst({
    where: {
      contactId: contact.id,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestOtp) {
    throw new Error('No pending verification code found. Please request a new code.');
  }

  // Check expiration
  if (new Date() > latestOtp.expiresAt) {
    throw new Error('Verification code has expired. Please request a new one.');
  }

  // Check attempt limit
  if (latestOtp.attempts >= MAX_ATTEMPTS) {
    throw new Error('Maximum verification attempts exceeded. Please request a new code.');
  }

  // Increment attempts counter
  await prisma.whatsappOtp.update({
    where: { id: latestOtp.id },
    data: { attempts: { increment: 1 } },
  });

  // Verify hash
  const submittedHash = hashOtp(cleanCode);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(submittedHash, 'hex'),
    Buffer.from(latestOtp.codeHash, 'hex')
  );

  if (!isValid) {
    const remainingAttempts = MAX_ATTEMPTS - (latestOtp.attempts + 1);
    throw new Error(`Incorrect verification code. ${remainingAttempts} attempts remaining.`);
  }

  // Mark OTP consumed
  const now = new Date();
  await prisma.whatsappOtp.update({
    where: { id: latestOtp.id },
    data: { consumedAt: now },
  });

  // Update contact to verified & opted in
  await prisma.whatsappContact.update({
    where: { id: contact.id },
    data: {
      userId: userId || contact.userId,
      verifiedAt: now,
      optedInAt: now,
      optedOutAt: null,
    },
  });

  // Send welcome confirmation message
  try {
    await waClient.sendText(
      normalized.e164,
      '🎉 Welcome to CONDUIT on WhatsApp! Your phone number is verified. You will receive instant notifications for verified trust requests and intent matches.\n\nReply MENU anytime to see options or STOP to unsubscribe.',
      { contactId: contact.id }
    );
  } catch (err) {
    console.warn('[WhatsApp Welcome Message] Notice:', err);
  }

  return {
    success: true,
    message: 'Phone number verified successfully! WhatsApp updates enabled.',
    contactId: contact.id,
    phoneE164: normalized.e164,
  };
}
