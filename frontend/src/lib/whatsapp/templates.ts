import { z } from 'zod';

export const KinOtpTemplateSchema = z.object({
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const KinIntroRequestTemplateSchema = z.object({
  alumnusName: z.string().min(1),
  institution: z.string().min(1),
  requirementTitle: z.string().min(1),
  matchId: z.string().min(1),
});

export const KinIntroAcceptedTemplateSchema = z.object({
  contactName: z.string().min(1),
  requirementTitle: z.string().min(1),
  connectUrl: z.string().url(),
});

export const KinFollowupTemplateSchema = z.object({
  alumnusName: z.string().min(1),
  requirementTitle: z.string().min(1),
  requirementId: z.string().min(1),
});

export const KinNewCandidateTemplateSchema = z.object({
  requirementTitle: z.string().min(1),
  candidateHeadline: z.string().min(1),
  fitScore: z.union([z.number(), z.string()]),
});

export type KinOtpTemplateParams = z.infer<typeof KinOtpTemplateSchema>;
export type KinIntroRequestTemplateParams = z.infer<typeof KinIntroRequestTemplateSchema>;
export type KinIntroAcceptedTemplateParams = z.infer<typeof KinIntroAcceptedTemplateSchema>;
export type KinFollowupTemplateParams = z.infer<typeof KinFollowupTemplateSchema>;
export type KinNewCandidateTemplateParams = z.infer<typeof KinNewCandidateTemplateSchema>;

export interface TemplateDefinition<T> {
  name: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  language: string;
  schema: z.ZodSchema<T>;
  buildComponents: (params: T) => any[];
}

export const TEMPLATES = {
  kin_otp: {
    name: 'kin_otp',
    category: 'AUTHENTICATION',
    language: 'en',
    schema: KinOtpTemplateSchema,
    buildComponents: (params: KinOtpTemplateParams) => [
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
  } as TemplateDefinition<KinOtpTemplateParams>,

  kin_intro_request: {
    name: 'kin_intro_request',
    category: 'UTILITY',
    language: 'en',
    schema: KinIntroRequestTemplateSchema,
    buildComponents: (params: KinIntroRequestTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.alumnusName },
          { type: 'text', text: params.institution },
          { type: 'text', text: params.requirementTitle },
        ],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '0',
        parameters: [{ type: 'payload', payload: `INTRO_YES_${params.matchId}` }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '1',
        parameters: [{ type: 'payload', payload: `INTRO_NO_${params.matchId}` }],
      },
    ],
  } as TemplateDefinition<KinIntroRequestTemplateParams>,

  kin_intro_accepted: {
    name: 'kin_intro_accepted',
    category: 'UTILITY',
    language: 'en',
    schema: KinIntroAcceptedTemplateSchema,
    buildComponents: (params: KinIntroAcceptedTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.contactName },
          { type: 'text', text: params.requirementTitle },
          { type: 'text', text: params.connectUrl },
        ],
      },
    ],
  } as TemplateDefinition<KinIntroAcceptedTemplateParams>,

  kin_followup: {
    name: 'kin_followup',
    category: 'UTILITY',
    language: 'en',
    schema: KinFollowupTemplateSchema,
    buildComponents: (params: KinFollowupTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.alumnusName },
          { type: 'text', text: params.requirementTitle },
        ],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '0',
        parameters: [{ type: 'payload', payload: `FOLLOWUP_YES_${params.requirementId}` }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '1',
        parameters: [{ type: 'payload', payload: `FOLLOWUP_NO_${params.requirementId}` }],
      },
      {
        type: 'button',
        sub_type: 'quick_reply',
        index: '2',
        parameters: [{ type: 'payload', payload: `FOLLOWUP_MORE_${params.requirementId}` }],
      },
    ],
  } as TemplateDefinition<KinFollowupTemplateParams>,

  kin_new_candidate: {
    name: 'kin_new_candidate',
    category: 'UTILITY',
    language: 'en',
    schema: KinNewCandidateTemplateSchema,
    buildComponents: (params: KinNewCandidateTemplateParams) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: params.requirementTitle },
          { type: 'text', text: params.candidateHeadline },
          { type: 'text', text: String(params.fitScore) },
        ],
      },
    ],
  } as TemplateDefinition<KinNewCandidateTemplateParams>,

  // Backward compatibility alias for otp
  conduit_otp: {
    name: 'conduit_otp',
    category: 'AUTHENTICATION',
    language: 'en',
    schema: KinOtpTemplateSchema,
    buildComponents: (params: KinOtpTemplateParams) => [
      {
        type: 'body',
        parameters: [{ type: 'text', text: params.code }],
      },
    ],
  } as TemplateDefinition<KinOtpTemplateParams>,
} as const;

export type TemplateKey = keyof typeof TEMPLATES;

