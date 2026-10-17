import { prisma } from '../../prisma';
import { waClient } from '../client';
import { FlowContext, FlowResult } from './types';
import { maskPhone } from '../phone';

export async function checkOrStartOnboarding(ctx: FlowContext): Promise<FlowResult | null> {
  const phone = ctx.contact.phoneE164;

  // 1. Check if known in Alumni table
  let alumnus = await prisma.alumni.findUnique({
    where: { phoneE164: phone },
  });

  if (alumnus) {
    if (!ctx.contact.name || !ctx.contact.institution) {
      await prisma.whatsappContact.update({
        where: { id: ctx.contact.id },
        data: {
          name: alumnus.name,
          institution: alumnus.institution,
          batch: alumnus.batch,
          consentGivenAt: alumnus.consentGivenAt || new Date(),
        },
      });
    }
    return null; // Known alumnus, proceed to requirement or command handler
  }

  // 2. Already consented contact
  if (ctx.contact.consentGivenAt) {
    return null; // Onboarded, proceed
  }

  // 3. In-flight onboarding state machine
  const state = ctx.conversationState;
  const step = state?.step || 'INIT';
  const data = state?.data ? JSON.parse(state.data) : {};
  const text = ctx.incomingText?.trim();
  const button = ctx.buttonId;

  if (button === 'kin_onboard_agree' || (text && text.toLowerCase() === 'agree')) {
    // Record consent with timestamp
    const now = new Date();
    const alumnusName = data.name || 'Alumnus';
    const institution = data.institution || 'College';
    const batch = data.batch || 'Alumni';

    const newAlumnus = await prisma.alumni.create({
      data: {
        name: alumnusName,
        phoneE164: phone,
        institution,
        batch,
        consentGivenAt: now,
      },
    });

    await prisma.whatsappContact.update({
      where: { id: ctx.contact.id },
      data: {
        name: alumnusName,
        institution,
        batch,
        consentGivenAt: now,
        optedInAt: now,
      },
    });

    await waClient.sendText(
      phone,
      `🎉 *Welcome to KIN, ${alumnusName}!*\n\nYour profile is verified. You can now message or send a voice note anytime describing who you need (a hire, an intern, a mentor, or collaborator).`
    );

    // If an initial requirement was queued during onboarding, process it
    if (data.pendingRequirementText) {
      return {
        handled: false,
        nextFlow: 'EXTRACTING',
        nextStep: 'INIT',
        clearState: false,
        data: { initialText: data.pendingRequirementText },
      };
    }

    return { handled: true, clearState: true };
  }

  if (button === 'kin_onboard_cancel') {
    await waClient.sendText(
      phone,
      `Onboarding cancelled. Reply "HI" whenever you're ready to get started!`
    );
    return { handled: true, clearState: true };
  }

  // Step transitions
  if (step === 'INIT' || !state || state.flow !== 'ONBOARDING') {
    await waClient.sendText(
      phone,
      `👋 *Welcome to KIN!* Connect directly with top college students and alumni for hires, interns, or project collaboration.\n\nTo begin, what is your *full name*?`
    );
    return {
      handled: true,
      nextFlow: 'ONBOARDING',
      nextStep: 'AWAITING_NAME',
      data: { pendingRequirementText: text && text.length > 5 && !['hi', 'hello', 'menu'].includes(text.toLowerCase()) ? text : null },
    };
  }

  if (step === 'AWAITING_NAME') {
    if (!text || text.length < 2) {
      await waClient.sendText(phone, `Please reply with your full name:`);
      return { handled: true, nextFlow: 'ONBOARDING', nextStep: 'AWAITING_NAME', data };
    }

    data.name = text;
    await waClient.sendText(
      phone,
      `Great to meet you, ${text}! Which *college or university* are you an alumnus of? (e.g. IIIT Delhi, BITS Pilani)`
    );
    return {
      handled: true,
      nextFlow: 'ONBOARDING',
      nextStep: 'AWAITING_INSTITUTION',
      data,
    };
  }

  if (step === 'AWAITING_INSTITUTION') {
    if (!text || text.length < 2) {
      await waClient.sendText(phone, `Please reply with your institution name:`);
      return { handled: true, nextFlow: 'ONBOARDING', nextStep: 'AWAITING_INSTITUTION', data };
    }

    data.institution = text;
    await waClient.sendText(phone, `Which graduating batch? (e.g. 2020, 2023)`);
    return {
      handled: true,
      nextFlow: 'ONBOARDING',
      nextStep: 'AWAITING_BATCH',
      data,
    };
  }

  if (step === 'AWAITING_BATCH') {
    data.batch = text || 'Alumni';

    const consentBody = [
      `Thanks ${data.name}! One final step:`,
      ``,
      `By using KIN, you agree to our Terms (https://kin.network/terms) and Privacy Policy (https://kin.network/privacy). We only share contact information when both parties explicitly accept an introduction.`,
      ``,
      `Tap *I Agree* to continue:`,
    ].join('\n');

    await waClient.sendInteractiveButtons(
      phone,
      consentBody,
      [
        { id: 'kin_onboard_agree', title: 'I Agree' },
        { id: 'kin_onboard_cancel', title: 'Cancel' },
      ],
      { footerText: 'KIN Network • Consent Verification' }
    );

    return {
      handled: true,
      nextFlow: 'ONBOARDING',
      nextStep: 'AWAITING_CONSENT',
      data,
    };
  }

  return null;
}
