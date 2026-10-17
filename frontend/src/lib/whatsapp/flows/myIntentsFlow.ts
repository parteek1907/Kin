import { FlowModule, FlowContext, FlowResult } from './types';
import { waClient } from '../client';

export const myIntentsFlow: FlowModule = {
  name: 'MY_INTENTS',

  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    return text === 'MY INTENTS' || text === 'INTENTS' || ctx.listRowId === 'NAV_MY_INTENTS';
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const message =
      '🎯 *Your Active Intents on CONDUIT*\n\n' +
      '1. *Distributed Consensus Engine in Rust*\n' +
      '   • Status: 🟢 Active • Fit Matches: 4 candidates\n' +
      '   • Target: Systems / Research\n\n' +
      '2. *High-Frequency Order Book Simulator*\n' +
      '   • Status: 🟢 Active • Fit Matches: 2 candidates\n' +
      '   • Target: FinTech / C++\n\n' +
      '_Type *POST INTENT* to add another, or *MY MATCHES* to inspect candidates._';

    try {
      await waClient.sendInteractiveButtons(
        ctx.contact.phoneE164,
        message,
        [
          { id: 'NAV_MY_MATCHES', title: 'View Matches' },
          { id: 'NAV_POST_INTENT', title: 'Post New Intent' },
        ]
      );
    } catch {
      await waClient.sendText(ctx.contact.phoneE164, message);
    }

    return {
      handled: true,
      clearState: true,
    };
  },
};
