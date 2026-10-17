import { FlowModule, FlowContext, FlowResult } from './types';
import { waClient } from '../client';

export const postIntentFlow: FlowModule = {
  name: 'POST_INTENT',

  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    if (text === 'POST INTENT' || ctx.buttonId === 'NAV_POST_INTENT' || ctx.listRowId === 'NAV_POST_INTENT') {
      return true;
    }
    // Check if user is currently in the POST_INTENT flow
    return ctx.conversationState?.flow === 'POST_INTENT';
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const text = (ctx.incomingText || '').trim();
    const currentStep = ctx.conversationState?.flow === 'POST_INTENT'
      ? ctx.conversationState.step
      : 'INIT';

    let storedData: Record<string, any> = {};
    try {
      storedData = JSON.parse(ctx.conversationState?.data || '{}');
    } catch {
      storedData = {};
    }

    // Step 0: User starts the flow
    if (currentStep === 'INIT' || text.toUpperCase() === 'POST INTENT' || ctx.listRowId === 'NAV_POST_INTENT') {
      await waClient.sendText(
        ctx.contact.phoneE164,
        '🚀 *Publish a New Intent on CONDUIT (1/3)*\n\nPlease enter the *Title* of your intent (e.g., _Rust Distributed Consensus Research_ or _Full-Stack Founding Engineer_):'
      );
      return {
        handled: true,
        nextFlow: 'POST_INTENT',
        nextStep: 'WAITING_TITLE',
        data: {},
      };
    }

    // Step 1: Receiving Title
    if (currentStep === 'WAITING_TITLE') {
      if (!text || text.length < 3) {
        await waClient.sendText(
          ctx.contact.phoneE164,
          '⚠️ Title is too short. Please provide a clear intent title (at least 3 characters):'
        );
        return { handled: true };
      }

      storedData.title = text;

      try {
        await waClient.sendInteractiveButtons(
          ctx.contact.phoneE164,
          `Got it: *${text}*\n\n*Step 2/3:* Select an intent category:`,
          [
            { id: 'CAT_ENGINEERING', title: 'Engineering' },
            { id: 'CAT_RESEARCH', title: 'Research' },
            { id: 'CAT_MENTORSHIP', title: 'Mentorship' },
          ]
        );
      } catch {
        await waClient.sendText(
          ctx.contact.phoneE164,
          `Got it: *${text}*\n\n*Step 2/3:* Reply with your category:\n- Engineering\n- Research\n- Mentorship`
        );
      }

      return {
        handled: true,
        nextFlow: 'POST_INTENT',
        nextStep: 'WAITING_CATEGORY',
        data: storedData,
      };
    }

    // Step 2: Receiving Category
    if (currentStep === 'WAITING_CATEGORY') {
      let category = 'Engineering';
      if (ctx.buttonId === 'CAT_ENGINEERING' || text.toUpperCase().includes('ENGINEERING')) category = 'Engineering';
      else if (ctx.buttonId === 'CAT_RESEARCH' || text.toUpperCase().includes('RESEARCH')) category = 'Research';
      else if (ctx.buttonId === 'CAT_MENTORSHIP' || text.toUpperCase().includes('MENTORSHIP')) category = 'Mentorship';
      else if (text) category = text;

      storedData.category = category;

      await waClient.sendText(
        ctx.contact.phoneE164,
        `Category set to *${category}*.\n\n*Step 3/3:* Describe your project, required skills, or qualifications in 1-2 sentences:`
      );

      return {
        handled: true,
        nextFlow: 'POST_INTENT',
        nextStep: 'WAITING_DESC',
        data: storedData,
      };
    }

    // Step 3: Receiving Description
    if (currentStep === 'WAITING_DESC') {
      storedData.description = text;

      const summary = `📋 *Review Your Intent*\n\n• *Title:* ${storedData.title}\n• *Category:* ${storedData.category}\n• *Description:* ${storedData.description}\n\nConfirm to publish onto the CONDUIT proof graph:`;

      try {
        await waClient.sendInteractiveButtons(
          ctx.contact.phoneE164,
          summary,
          [
            { id: 'POST_INTENT_CONFIRM', title: 'Confirm & Post' },
            { id: 'POST_INTENT_CANCEL', title: 'Cancel' },
          ]
        );
      } catch {
        await waClient.sendText(
          ctx.contact.phoneE164,
          `${summary}\n\nReply *CONFIRM* to publish or *CANCEL* to discard.`
        );
      }

      return {
        handled: true,
        nextFlow: 'POST_INTENT',
        nextStep: 'CONFIRM',
        data: storedData,
      };
    }

    // Step 4: Confirmation
    if (currentStep === 'CONFIRM') {
      const isConfirmed = ctx.buttonId === 'POST_INTENT_CONFIRM' || text.toUpperCase() === 'CONFIRM';
      const isCancelled = ctx.buttonId === 'POST_INTENT_CANCEL' || text.toUpperCase() === 'CANCEL';

      if (isCancelled) {
        await waClient.sendText(
          ctx.contact.phoneE164,
          '❌ Intent creation cancelled. Type *MENU* to return to main options.'
        );
        return {
          handled: true,
          clearState: true,
        };
      }

      if (isConfirmed) {
        const intentId = `int-${Date.now().toString().slice(-6)}`;
        console.log(`[CONDUIT WhatsApp Bot] Created intent ${intentId}:`, storedData);

        await waClient.sendText(
          ctx.contact.phoneE164,
          `✅ *Intent Published!*\n\nReference: \`${intentId}\`\nYour intent *"${storedData.title}"* is now active on the CONDUIT Proof Network. You will receive WhatsApp notifications when compatible candidate nodes are matched.`
        );

        return {
          handled: true,
          clearState: true,
        };
      }
    }

    return { handled: false };
  },
};
