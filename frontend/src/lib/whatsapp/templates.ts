import { z } from 'zod';

export const OtpTemplateSchema = z.object({
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const NewMatchTemplateSchema = z.object({
  intentTitle: z.string().min(1),
  matchName: z.string().min(1),
  fitPercentage: z.number().int().min(0).max(100),
});

export const TrustRequestTemplateSchema = z.object({
  requesterName: z.string().min(1),
  requestId: z.string().min(1),
});

export const NodeVerifiedTemplateSchema = z.object({
  nodeTitle: z.string().min(1),
});

export const IntentUpdateTemplateSchema = z.object({
  intentTitle: z.string().min(1),
  statusText: z.string().min(1),
});

export const WeeklyDigestTemplateSchema = z.object({
  activeNodes: z.union([z.number(), z.string()]),
  newEdges: z.union([z.number(), z.string()]),
  matchCount: z.union([z.number(), z.string()]),
});

export type OtpTemplateParams = z.infer<typeof OtpTemplateSchema>;
export type NewMatchTemplateParams = z.infer<typeof NewMatchTemplateSchema>;
export type TrustRequestTemplateParams = z.infer<typeof TrustRequestTemplateSchema>;
export type NodeVerifiedTemplateParams = z.infer<typeof NodeVerifiedTemplateSchema>;
export type IntentUpdateTemplateParams = z.infer<typeof IntentUpdateTemplateSchema>;
export type WeeklyDigestTemplateParams = z.infer<typeof WeeklyDigestTemplateSchema>;

export interface TemplateDefinition<T> {
  name: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  language: string;
  schema: z.ZodSchema<T>;
  buildComponents: (params: T) => any[];
}

export const TEMPLATES = {
  conduit_otp: {
    name: 'conduit_otp',
    category: 'AUTHENTICATION',
    language: 'en',
    schema: OtpTemplateSchema,
    buildComponents: (params: OtpTemplateParams) => [
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: params.code,
          },
        ],
      },
      {
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: params.code,
          },
        ],
      },
    ],
  } as TemplateDefinition<OtpTemplateParams>,

  conduit_new_match: {
    name: 'conduit_new_match',
    category: 'UTILITY',
    language: 'en',
    schema: NewMatchTemplateSchema,
    buildComponents: (params: NewMatchTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.intentTitle },
          { type: 'text', text: params.matchName },
          { type: 'text', text: String(params.fitPercentage) },
        ],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '0',
        parameters: [{ type: 'payload', payload: `VIEW_MATCH_${encodeURIComponent(params.intentTitle)}` }],
      },
    ],
  } as TemplateDefinition<NewMatchTemplateParams>,

  conduit_trust_request: {
    name: 'conduit_trust_request',
    category: 'UTILITY',
    language: 'en',
    schema: TrustRequestTemplateSchema,
    buildComponents: (params: TrustRequestTemplateParams) => [
      {
        type: 'body',
        parameters: [{ type: 'text', text: params.requesterName }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '0',
        parameters: [{ type: 'payload', payload: `ACCEPT_TRUST_${params.requestId}` }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '1',
        parameters: [{ type: 'payload', payload: `DECLINE_TRUST_${params.requestId}` }],
      },
    ],
  } as TemplateDefinition<TrustRequestTemplateParams>,

  conduit_node_verified: {
    name: 'conduit_node_verified',
    category: 'UTILITY',
    language: 'en',
    schema: NodeVerifiedTemplateSchema,
    buildComponents: (params: NodeVerifiedTemplateParams) => [
      {
        type: 'body',
        parameters: [{ type: 'text', text: params.nodeTitle }],
      },
    ],
  } as TemplateDefinition<NodeVerifiedTemplateParams>,

  conduit_intent_update: {
    name: 'conduit_intent_update',
    category: 'UTILITY',
    language: 'en',
    schema: IntentUpdateTemplateSchema,
    buildComponents: (params: IntentUpdateTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.intentTitle },
          { type: 'text', text: params.statusText },
        ],
      },
    ],
  } as TemplateDefinition<IntentUpdateTemplateParams>,

  conduit_weekly_digest: {
    name: 'conduit_weekly_digest',
    category: 'UTILITY',
    language: 'en',
    schema: WeeklyDigestTemplateSchema,
    buildComponents: (params: WeeklyDigestTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(params.activeNodes) },
          { type: 'text', text: String(params.newEdges) },
          { type: 'text', text: String(params.matchCount) },
        ],
      },
    ],
  } as TemplateDefinition<WeeklyDigestTemplateParams>,
} as const;

export type TemplateKey = keyof typeof TEMPLATES;
