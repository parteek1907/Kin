import { FlowModule, FlowContext, FlowResult } from './types';
import { prisma } from '../../prisma';
import { waClient } from '../client';

export const stopStartFlow: FlowModule = {
  name: 'STOP_START',

  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    return text === 'STOP' || text === 'UNSUBSCRIBE' || text === 'START' || text === 'RESUBSCRIBE';
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    const isStop = text === 'STOP' || text === 'UNSUBSCRIBE';

    if (isStop) {
      // 1. Set opted_out_at immediately
      await prisma.whatsappContact.update({
        where: { id: ctx.contact.id },
        data: {
          optedOutAt: new Date(),
        },
      });

      // 2. Confirm once, then send nothing else
      await waClient.sendText(
        ctx.contact.phoneE164,
        '🛑 You have unsubscribed from CONDUIT WhatsApp updates. No further messages will be sent.\n\nReply START anytime if you wish to re-subscribe.'
      );

      return {
        handled: true,
        clearState: true,
      };
    } else {
      // Re-subscribe
      await prisma.whatsappContact.update({
        where: { id: ctx.contact.id },
        data: {
          optedOutAt: null,
          optedInAt: new Date(),
        },
      });

      await waClient.sendText(
        ctx.contact.phoneE164,
        '✅ Welcome back! Your CONDUIT notifications on WhatsApp have been reactivated.\n\nReply MENU to view options.'
      );

      return {
        handled: true,
        clearState: true,
      };
    }
  },
};
