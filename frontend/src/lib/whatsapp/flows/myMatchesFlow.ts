import { FlowModule, FlowContext, FlowResult } from './types';
import { waClient } from '../client';

export const myMatchesFlow: FlowModule = {
  name: 'MY_MATCHES',

  canHandle: (ctx: FlowContext) => {
    const text = (ctx.incomingText || '').trim().toUpperCase();
    return text === 'MY MATCHES' || text === 'MATCHES' || ctx.listRowId === 'NAV_MY_MATCHES' || ctx.buttonId === 'NAV_MY_MATCHES';
  },

  handle: async (ctx: FlowContext): Promise<FlowResult> => {
    const message =
      '✨ *Top Graph Matches for Your Intents*\n\n' +
      '1. *Elena Rostova* (Principal Systems Engineer @ NexaML)\n' +
      '   • Fit: *94%* • Bridge Skills: Rust, Distributed Memory, Linux Kernel\n' +
      '   • Vouched by: Dr. Aarav Sharma\n\n' +
      '2. *Rohan Mehta* (Founding Engineer @ Stealth Robotics)\n' +
      '   • Fit: *88%* • Bridge Skills: C++, High-Performance Networking\n' +
      '   • Status: Welcoming Student Builders\n\n' +
      '_Visit the CONDUIT dashboard to initiate warm introductions._';

    await waClient.sendText(ctx.contact.phoneE164, message);

    return {
      handled: true,
      clearState: true,
    };
  },
};
