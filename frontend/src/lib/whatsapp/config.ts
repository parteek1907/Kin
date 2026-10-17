import { z } from 'zod';

const WhatsAppConfigSchema = z.object({
  accessToken: z.string().min(1, 'WA_ACCESS_TOKEN is required for Meta Graph API calls'),
  phoneNumberId: z.string().min(1, 'WA_PHONE_NUMBER_ID is required to identify the sender phone'),
  businessAccountId: z.string().min(1, 'WA_BUSINESS_ACCOUNT_ID is required'),
  appSecret: z.string().min(1, 'WA_APP_SECRET is required to verify webhook HMAC-SHA256 signatures'),
  verifyToken: z.string().min(1, 'WA_VERIFY_TOKEN is required to complete Meta webhook verification'),
  graphVersion: z.string().default('v21.0'),
  publicBusinessNumber: z.string().regex(/^\d+$/, 'NEXT_PUBLIC_WA_BUSINESS_NUMBER must contain only digits'),
  apiUrl: z.string().url(),
  transcriptionProvider: z.enum(['openai', 'whisper', 'mock']).default('openai'),
  transcriptionApiKey: z.string().optional(),
  llmApiKey: z.string().optional(),
  matchWeights: z.string().default('{}'),
  dailyRequirementsLimit: z.number().default(10),
});

export type WhatsAppConfig = z.infer<typeof WhatsAppConfigSchema>;

function loadConfig(): WhatsAppConfig {
  const isBuild =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NEXT_RUNTIME === 'edge';

  const isEnforced =
    !isBuild &&
    (process.env.WA_STRICT_CONFIG === 'true' ||
      (process.env.NODE_ENV === 'production' && Boolean(process.env.WA_ACCESS_TOKEN)));

  const raw = {
    accessToken: process.env.WA_ACCESS_TOKEN || (isEnforced ? '' : 'mock_wa_access_token'),
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID || (isEnforced ? '' : '109876543210987'),
    businessAccountId: process.env.WA_BUSINESS_ACCOUNT_ID || (isEnforced ? '' : '987654321098765'),
    appSecret: process.env.WA_APP_SECRET || (isEnforced ? '' : 'mock_app_secret_for_webhook_signature'),
    verifyToken: process.env.WA_VERIFY_TOKEN || (isEnforced ? '' : 'kin_meta_verify_token_default'),
    graphVersion: process.env.WA_GRAPH_VERSION || 'v21.0',
    publicBusinessNumber: process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER || '919811022678',
    transcriptionProvider: (process.env.TRANSCRIPTION_PROVIDER as any) || 'openai',
    transcriptionApiKey: process.env.TRANSCRIPTION_API_KEY || process.env.OPENAI_API_KEY || '',
    llmApiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
    matchWeights: process.env.MATCH_WEIGHTS || '{}',
    dailyRequirementsLimit: 10,
  };

  const parsed = WhatsAppConfigSchema.safeParse({
    ...raw,
    apiUrl: `https://graph.facebook.com/${raw.graphVersion}/${raw.phoneNumberId}`,
  });

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => ` - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    const msg = `[WhatsApp Config Error] Missing or invalid Meta Cloud API configuration:\n${errorDetails}\nPlease check your .env or .env.local file.`;

    if (isEnforced) {
      throw new Error(msg);
    } else {
      console.warn(`\x1b[33m${msg}\x1b[0m`);
      return {
        accessToken: raw.accessToken || 'mock_wa_access_token',
        phoneNumberId: raw.phoneNumberId || '109876543210987',
        businessAccountId: raw.businessAccountId || '987654321098765',
        appSecret: raw.appSecret || 'mock_app_secret_for_webhook_signature',
        verifyToken: raw.verifyToken || 'kin_meta_verify_token_default',
        graphVersion: raw.graphVersion,
        publicBusinessNumber: raw.publicBusinessNumber,
        apiUrl: `https://graph.facebook.com/${raw.graphVersion}/${raw.phoneNumberId || '109876543210987'}`,
        transcriptionProvider: 'openai',
        transcriptionApiKey: raw.transcriptionApiKey,
        llmApiKey: raw.llmApiKey,
        matchWeights: raw.matchWeights,
        dailyRequirementsLimit: 10,
      };
    }
  }

  return parsed.data;
}

export const waConfig = loadConfig();

