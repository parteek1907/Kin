import { FlowModule, FlowContext, FlowResult } from './types';
import { stopStartFlow } from './stopStartFlow';
import { menuFlow } from './menuFlow';
import { postIntentFlow } from './postIntentFlow';
import { trustFlow } from './trustFlow';
import { myIntentsFlow } from './myIntentsFlow';
import { myMatchesFlow } from './myMatchesFlow';
import { prisma } from '../../prisma';
import { waClient } from '../client';

export const FLOW_REGISTRY: FlowModule[] = [
  stopStartFlow,
  postIntentFlow,
  trustFlow,
  myIntentsFlow,
  myMatchesFlow,
  menuFlow,
];

export async function processInboundFlow(ctx: FlowContext): Promise<void> {
  // 1. Handle unverified contact
  if (!ctx.contact.verifiedAt) {
    await waClient.sendText(
      ctx.contact.phoneE164,
      '🔒 *CONDUIT — Unverified Phone Number*\n\nYour number has not yet been linked to an active CONDUIT account.\n\nPlease visit the website settings page to link and verify your phone number to access automated matches and trust updates.'
    );
    return;
  }

  // 2. Handle incoming media messages (voice, image, document)
  if (ctx.mediaType && ctx.mediaType !== 'text') {
    await waClient.sendText(
      ctx.contact.phoneE164,
      '📎 Thanks for sharing. We received your attachment, but the CONDUIT automated assistant currently only accepts text messages and button selections.\n\nPlease type *MENU* to see available options.'
    );
    return;
  }

  // 3. STOP must immediately execute regardless of ongoing flow state
  const rawText = (ctx.incomingText || '').trim().toUpperCase();
  if (rawText === 'STOP' || rawText === 'UNSUBSCRIBE') {
    await stopStartFlow.handle(ctx);
    await prisma.whatsappConversationState.deleteMany({
      where: { contactId: ctx.contact.id },
    });
    return;
  }

  // 4. Try ongoing active conversation flow first (if in multi-step flow)
  if (ctx.conversationState && ctx.conversationState.flow === 'POST_INTENT') {
    const result = await postIntentFlow.handle(ctx);
    if (result.handled) {
      await updateConversationState(ctx.contact.id, result);
      return;
    }
  }

  // 5. Try registry flows
  for (const flow of FLOW_REGISTRY) {
    if (flow.canHandle(ctx)) {
      const result = await flow.handle(ctx);
      if (result.handled) {
        await updateConversationState(ctx.contact.id, result);
        return;
      }
    }
  }

  // 6. Unknown input fallback with Menu button
  try {
    await waClient.sendInteractiveButtons(
      ctx.contact.phoneE164,
      `I didn't quite catch that ("${(ctx.incomingText || '').slice(0, 30)}").\n\nYou can select *Open Menu* below or type *HELP* to view supported commands.`,
      [{ id: 'ACTION_MENU', title: 'Open Menu' }],
      { footerText: 'CONDUIT Campus Proof Network' }
    );
  } catch {
    await waClient.sendText(
      ctx.contact.phoneE164,
      `I didn't quite catch that.\n\nReply *MENU* to view your options, or *HELP* to see supported commands.`
    );
  }
}

async function updateConversationState(contactId: string, result: FlowResult) {
  if (result.clearState) {
    await prisma.whatsappConversationState.deleteMany({
      where: { contactId },
    });
    return;
  }

  if (result.nextFlow && result.nextStep) {
    const dataString = JSON.stringify(result.data || {});
    await prisma.whatsappConversationState.upsert({
      where: { contactId },
      create: {
        contactId,
        flow: result.nextFlow,
        step: result.nextStep,
        data: dataString,
      },
      update: {
        flow: result.nextFlow,
        step: result.nextStep,
        data: dataString,
      },
    });
  }
}
