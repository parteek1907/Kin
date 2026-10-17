import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { waClient } from '@/lib/whatsapp/client';
import { normalizePhone, maskPhone } from '@/lib/whatsapp/phone';
import { executePermanentDataDeletion } from '@/lib/whatsapp/deletion';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, code } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid phone number is required.' },
        { status: 400 }
      );
    }

    const norm = normalizePhone(phone);
    if (!norm.isValid) {
      return NextResponse.json(
        { success: false, error: norm.error || 'Invalid phone number format. Please include country code e.g. +91 9876543210' },
        { status: 400 }
      );
    }

    const phoneE164 = norm.e164;

    // ----------------------------------------------------
    // Action 1: Request 6-digit verification code via WhatsApp
    // ----------------------------------------------------
    if (action === 'request-code') {
      const codeDigits = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = crypto.createHash('sha256').update(codeDigits).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Find or create contact
      let contact = await prisma.whatsappContact.findUnique({
        where: { phoneE164 },
      });

      if (!contact) {
        contact = await prisma.whatsappContact.create({
          data: { phoneE164, language: 'en' },
        });
      }

      // Store OTP
      await prisma.whatsappOtp.create({
        data: {
          contactId: contact.id,
          codeHash,
          expiresAt,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      // Dispatch code via WhatsApp
      const waMessage = [
        '🔒 *KIN Data Deletion Verification*',
        '',
        `Your 6-digit confirmation code is: *${codeDigits}*`,
        '',
        'Enter this code on the website to permanently erase all personal data, requirements, voice transcripts, and intro history in accordance with India\'s DPDP Act 2023.',
        'This code expires in 10 minutes. If you did not request this, please ignore.',
      ].join('\n');

      try {
        await waClient.sendText(phoneE164, waMessage);
      } catch (err: any) {
        console.error('[Data Deletion OTP] Failed to send WhatsApp text:', err.message);
        // Even if outbound test number hits sandbox limit, we log clearly
      }

      return NextResponse.json({
        success: true,
        maskedPhone: maskPhone(phoneE164),
        message: `A 6-digit verification code has been dispatched to ${maskPhone(phoneE164)} via WhatsApp.`,
      });
    }

    // ----------------------------------------------------
    // Action 2: Verify 6-digit code and permanently erase data
    // ----------------------------------------------------
    if (action === 'verify-and-delete') {
      if (!code || typeof code !== 'string' || code.trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: 'A 6-digit verification code is required.' },
          { status: 400 }
        );
      }

      const inputHash = crypto.createHash('sha256').update(code.trim()).digest('hex');

      const contact = await prisma.whatsappContact.findUnique({
        where: { phoneE164 },
      });

      if (!contact) {
        return NextResponse.json(
          { success: false, error: 'No active records found for this phone number.' },
          { status: 404 }
        );
      }

      const validOtp = await prisma.whatsappOtp.findFirst({
        where: {
          contactId: contact.id,
          codeHash: inputHash,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!validOtp) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired verification code. Please request a new code.' },
          { status: 400 }
        );
      }

      // Mark OTP as consumed
      await prisma.whatsappOtp.update({
        where: { id: validOtp.id },
        data: { consumedAt: new Date() },
      });

      // Execute permanent data erasure
      const result = await executePermanentDataDeletion(phoneE164, 'web_form');

      // Send final confirmation over WhatsApp
      try {
        await waClient.sendText(
          phoneE164,
          `✅ *Data Erasure Confirmed*\n\nYour profile, message bodies, audio transcripts, requirements, and introduction history have been permanently deleted from KIN.\n\n*Confirmation Code:* ${result.confirmationCode}\n*Timestamp:* ${result.timestamp}\n\nOnly an anonymous compliance hash was retained.`
        );
      } catch (e) {
        // Ignore if outbound window closed
      }

      return NextResponse.json({
        success: true,
        confirmationCode: result.confirmationCode,
        timestamp: result.timestamp,
        status: 'completed',
        phoneHash: result.phoneHash,
        message: 'All personal data, message bodies, transcripts, requirements, and introduction history have been permanently erased.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Supported actions: request-code, verify-and-delete.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Data Deletion API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred during data deletion.' },
      { status: 500 }
    );
  }
}
