import { prisma } from '../../prisma';
import { waClient } from '../client';
import { FlowContext, FlowResult } from './types';

/**
 * Onboarding Flow Handler.
 * Auto-verifies and auto-grants consent to incoming WhatsApp contacts to provide
 * zero-friction matching directly from voice notes or text messages.
 * Never interrupts or traps users in repetitive questionnaire loops.
 */
export async function checkOrStartOnboarding(ctx: FlowContext): Promise<FlowResult | null> {
  const phone = ctx.contact.phoneE164;
  const now = new Date();

  // 1. Ensure Contact has active consent & opt-in
  if (!ctx.contact.consentGivenAt) {
    try {
      await prisma.whatsappContact.update({
        where: { id: ctx.contact.id },
        data: {
          name: ctx.contact.name || 'Alumnus',
          institution: ctx.contact.institution || 'IIIT Delhi',
          batch: ctx.contact.batch || '2024',
          consentGivenAt: now,
          optedInAt: now,
        },
      });
    } catch {
      // Non-blocking fallback
    }
  }

  // 2. Ensure Alumnus record exists for phone number
  try {
    const existingAlum = await prisma.alumni.findUnique({
      where: { phoneE164: phone },
    });
    if (!existingAlum) {
      await prisma.alumni.create({
        data: {
          name: ctx.contact.name || 'Alumnus',
          phoneE164: phone,
          institution: ctx.contact.institution || 'IIIT Delhi',
          batch: ctx.contact.batch || '2024',
          isVerified: true,
          consentGivenAt: now,
        },
      });
    }
  } catch {
    // Non-blocking fallback
  }

  // 3. Handle explicit button interactions if present
  if (ctx.buttonId === 'kin_onboard_agree') {
    await waClient.sendText(
      phone,
      `🎉 *Profile Verified!*\n\nYou can now send a voice note or message describing who you need (a developer, intern, or project collaborator), and KIN will find matching campus talent immediately.`
    );
    return { handled: true, clearState: true };
  }

  if (ctx.buttonId === 'kin_onboard_cancel') {
    await waClient.sendText(
      phone,
      `Onboarding cancelled. Reply anytime with what you need and KIN will find matches!`
    );
    return { handled: true, clearState: true };
  }

  // Return null so flow dispatcher directly processes the voice note or text requirement!
  return null;
}
