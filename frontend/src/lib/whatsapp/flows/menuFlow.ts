import { FlowModule, FlowContext, FlowResult } from './types';
import { waClient } from '../client';

export const menuFlow: FlowModule = {
  name: 'MENU',
  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    return (
      text === 'MENU' ||
      text === 'HI' ||
      text === 'HELLO' ||
      text === 'HELP' ||
      ctx.buttonId === 'ACTION_MENU' ||
      ctx.listRowId === 'ACTION_MENU'
    );
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const sections = [
      {
        title: 'Academic & Career Intents',
        rows: [
          {
            id: 'NAV_MY_INTENTS',
            title: 'My Active Intents',
            description: 'Inspect your active recruitment & mentorship intents',
          },
          {
            id: 'NAV_POST_INTENT',
            title: 'Post New Intent',
            description: 'Publish a new project, bounty, or hiring intent',
          },
          {
            id: 'NAV_MY_MATCHES',
            title: 'My Matches',
            description: 'View high-conviction proof network graph matches',
          },
        ],
      },
      {
        title: 'Trust Graph & Edges',
        rows: [
          {
            id: 'NAV_TRUST_REQUESTS',
            title: 'Trust Requests',
            description: 'Review pending peer & faculty vouch requests',
          },
          {
            id: 'NAV_HELP',
            title: 'Help & Commands',
            description: 'View supported WhatsApp commands & keyword guide',
          },
        ],
      },
    ];

    try {
      await waClient.sendInteractiveList(
        ctx.contact.phoneE164,
        '⚡ *CONDUIT — Campus Trust & Opportunity Gateway*\n\nSelect an option below to interact directly with your proof network:',
        'Open Menu',
        sections,
        { footerText: 'Reply STOP anytime to opt out.' }
      );
    } catch {
      // Fallback text if list interactive is not supported
      await waClient.sendText(
        ctx.contact.phoneE164,
        '⚡ *CONDUIT Menu*\n\n1. *MY INTENTS* - Check your active intents\n2. *POST INTENT* - Post a new verified intent\n3. *MY MATCHES* - View your proof graph matches\n4. *TRUST REQUESTS* - Manage vouch requests\n5. *STOP* - Pause WhatsApp notifications'
      );
    }

    return {
      handled: true,
      clearState: true,
    };
  },
};
