import crypto from 'crypto';

/**
 * Simulates Meta sending an inbound voice note webhook event
 * Usage: npx tsx scripts/wa-simulate-voice.ts [port]
 */
async function main() {
  const port = process.argv[2] || process.env.PORT || '3000';
  const targetUrl = `http://localhost:${port}/api/whatsapp/webhook`;
  const appSecret = process.env.WA_APP_SECRET || 'mock_app_secret_for_webhook_signature';

  const sampleVoicePayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '28758626620442523',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '919811022678',
                phone_number_id: '1292744823932915',
              },
              contacts: [
                {
                  profile: { name: 'Arjun Alumnus' },
                  wa_id: '919811022678',
                },
              ],
              messages: [
                {
                  from: '919811022678',
                  id: `wamid.VOICE_${Date.now()}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: 'audio',
                  audio: {
                    id: 'sample_audio_media_id_12345',
                    mime_type: 'audio/ogg; codecs=opus',
                  },
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  const rawBody = JSON.stringify(sampleVoicePayload);
  const signature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  console.log(`🎙️ Posting HMAC-SHA256 signed voice note webhook to ${targetUrl}...`);

  try {
    const startTime = Date.now();
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
      },
      body: rawBody,
    });

    const elapsed = Date.now() - startTime;
    const body = await res.text();

    console.log(`Status: ${res.status} (${elapsed}ms)`);
    console.log(`Response: ${body}`);

    if (res.ok && elapsed < 2000) {
      console.log('✅ PASS: Webhook processed signed voice note within < 2 seconds.');
    } else if (!res.ok) {
      console.error('❌ FAIL: Webhook returned non-200 status.');
    } else {
      console.warn('⚠️ WARNING: Webhook response exceeded 2-second SLA limit.');
    }
  } catch (err: any) {
    console.error('Connection failed:', err.message);
    console.log('Tip: Make sure the Next.js dev server is running on port ' + port);
  }
}

main().catch(console.error);
