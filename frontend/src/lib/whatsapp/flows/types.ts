import { WhatsappContact, WhatsappConversationState } from '@prisma/client';

export interface FlowContext {
  contact: WhatsappContact;
  conversationState: WhatsappConversationState | null;
  incomingText?: string;
  buttonId?: string;
  listRowId?: string;
  mediaType?: string;
  waMessageId: string;
}

export interface FlowResult {
  handled: boolean;
  nextFlow?: string;
  nextStep?: string;
  data?: Record<string, any>;
  clearState?: boolean;
}

export interface FlowModule {
  name: string;
  canHandle: (ctx: FlowContext) => boolean;
  handle: (ctx: FlowContext) => Promise<FlowResult>;
}
