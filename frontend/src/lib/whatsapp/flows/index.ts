import { prisma } from '../../prisma';
import { FlowContext, FlowResult } from './types';
import { checkOrStartOnboarding } from './onboardingFlow';
import { handleButtonOrListReply } from './buttonRouter';
import { enqueueJob } from '../queue';
import { waClient } from '../client';
import { resolveCommand } from './commandRouter';

export async function processInboundFlow(ctx: FlowContext): Promise<FlowResult> {
  const phone = ctx.contact.phoneE164;

  // 1. If Contact has opted out, only allow START
  if (ctx.contact.optedOutAt) {
    const cmd = resolveCommand(ctx.incomingText);
    if (cmd === 'START') {
      const { handleStartCommand } = await import('./commands');
      await handleStartCommand(ctx.contact);
      return { handled: true };
    }
    // Suppress all processing when opted out
    return { handled: true };
  }

  // 2. Handle Interactive Replies (Buttons / List selections)
  if (ctx.buttonId || ctx.listRowId) {
    const buttonResult = await handleButtonOrListReply(ctx);
    if (buttonResult.handled) {
      if (buttonResult.clearState) {
        await prisma.whatsappConversationState.deleteMany({
          where: { contactId: ctx.contact.id },
        });
      } else if (buttonResult.nextFlow) {
        await prisma.whatsappConversationState.upsert({
          where: { contactId: ctx.contact.id },
          update: {
            flow: buttonResult.nextFlow,
            step: buttonResult.nextStep || 'INIT',
            data: JSON.stringify(buttonResult.data || {}),
          },
          create: {
            contactId: ctx.contact.id,
            flow: buttonResult.nextFlow,
            step: buttonResult.nextStep || 'INIT',
            data: JSON.stringify(buttonResult.data || {}),
          },
        });
      }
      return buttonResult;
    }
  }

  // 3. Handle First-Time Alumni Onboarding & Consent
  const onboardingResult = await checkOrStartOnboarding(ctx);
  if (onboardingResult && onboardingResult.handled) {
    if (onboardingResult.clearState) {
      await prisma.whatsappConversationState.deleteMany({
        where: { contactId: ctx.contact.id },
      });
    } else if (onboardingResult.nextFlow) {
      await prisma.whatsappConversationState.upsert({
        where: { contactId: ctx.contact.id },
        update: {
          flow: onboardingResult.nextFlow,
          step: onboardingResult.nextStep || 'INIT',
          data: JSON.stringify(onboardingResult.data || {}),
        },
        create: {
          contactId: ctx.contact.id,
          flow: onboardingResult.nextFlow,
          step: onboardingResult.nextStep || 'INIT',
          data: JSON.stringify(onboardingResult.data || {}),
        },
      });
    }
    return onboardingResult;
  }

  // 4. Handle Voice Note Media
  if (ctx.mediaType === 'audio') {
    // Extract media ID from state or context extra if passed
    const mediaId = (ctx as any).mediaId;
    if (mediaId) {
      await enqueueJob('process_inbound_voice', {
        contactId: ctx.contact.id,
        phoneE164: phone,
        waMessageId: ctx.waMessageId,
        mediaId,
      });
      return { handled: true };
    }
  }

  // 5. Handle Inbound Text Requirement or Command
  if (ctx.incomingText) {
    await enqueueJob('process_inbound_text', {
      contactId: ctx.contact.id,
      phoneE164: phone,
      waMessageId: ctx.waMessageId,
      text: ctx.incomingText,
    });
    return { handled: true };
  }

  // 6. Unknown Media or Fallback
  await waClient.sendText(
    phone,
    `KIN supports voice notes and text messages to find campus hires, interns, and collaborators.\n\nReply "MENU" to see all options.`
  );

  return { handled: true };
}
