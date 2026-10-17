import { FlowModule, FlowContext, FlowResult } from './types';
import { waClient } from '../client';

export const trustFlow: FlowModule = {
  name: 'TRUST_REQUESTS',

  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    const btn = ctx.buttonId || '';
    return (
      text === 'TRUST REQUESTS' ||
      text === 'TRUST' ||
      ctx.listRowId === 'NAV_TRUST_REQUESTS' ||
      btn.startsWith('ACCEPT_TRUST_') ||
      btn.startsWith('DECLINE_TRUST_') ||
      btn.startsWith('TRUST_ACCEPT_') ||
      btn.startsWith('TRUST_DECLINE_')
    );
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const btn = ctx.buttonId || '';

    // Handle Accept Trust Request button action
    if (btn.startsWith('ACCEPT_TRUST_') || btn.startsWith('TRUST_ACCEPT_')) {
      const requestId = btn.split('_').pop() || 'req_current';
      console.log(`[CONDUIT WhatsApp Bot] Trust Request Accepted: ${requestId} by ${ctx.contact.phoneE164}`);

      await waClient.sendText(
        ctx.contact.phoneE164,
        `🤝 *Trust Edge Verified!*\n\nYou have accepted the connection request. A cryptographic trust edge has been recorded on the CONDUIT campus proof graph.\n\nChannel initiated with the verified peer.`
      );

      return {
        handled: true,
        clearState: true,
      };
    }

    // Handle Decline Trust Request button action
    if (btn.startsWith('DECLINE_TRUST_') || btn.startsWith('TRUST_DECLINE_')) {
      const requestId = btn.split('_').pop() || 'req_current';
      console.log(`[CONDUIT WhatsApp Bot] Trust Request Declined: ${requestId} by ${ctx.contact.phoneE164}`);

      await waClient.sendText(
        ctx.contact.phoneE164,
        `Connection request \`${requestId}\` declined. Your proof score remains unchanged.`
      );

      return {
        handled: true,
        clearState: true,
      };
    }

    // If user asked to view pending trust requests
    await waClient.sendInteractiveButtons(
      ctx.contact.phoneE164,
      '🤝 *Pending Trust Request*\n\n• *From:* Dr. Aarav Sharma (Founding Engineer @ NexaML)\n• *Credentials:* Verified Alumni 2021\n• *Context:* Research collaboration in distributed CUDA systems',
      [
        { id: 'ACCEPT_TRUST_aarav', title: 'Accept Trust Edge' },
        { id: 'DECLINE_TRUST_aarav', title: 'Decline' },
      ],
      { footerText: 'Replying updates your Proof Graph' }
    );

    return {
      handled: true,
      clearState: true,
    };
  },
};
