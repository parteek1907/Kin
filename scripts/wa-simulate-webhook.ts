#!/usr/bin/env npx tsx
/**
 * Test script to simulate signed Meta webhook callbacks against local server.
 * Usage: npx tsx scripts/wa-simulate-webhook.ts [text_message] [from_phone]
 * Example: npx tsx scripts/wa-simulate-webhook.ts "MENU" "+919811022678"
 */

import crypto from 'crypto';

const TARGET_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/whatsapp/webhook';
const APP_SECRET = process.env.WA_APP_SECRET || 'mock_app_secret_for_webhook_signature';

async function sendSignedWebhook(payload: any, label: string) {
  const rawBody = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', APP_SECRET);
  const signature = 'sha256=' + hmac.update(rawBody, 'utf-8').digest('hex');

  console.log(`\n📡 Simulating ${label} to ${TARGET_URL}...`);

  try {
    const res = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': signature,
      },
      body: rawBody,
    });

    const text = await res.text();
    console.log(`   Response Status: ${res.status} ${res.statusText}`);
    console.log(`   Response Body:   ${text}`);

    if (!res.ok) {
      throw new Error(`Webhook responded with status ${res.status}`);
    }
  } catch (err: any) {
    console.error(`❌ Webhook Simulation Failed:`, err.message);
  }
}

async function main() {
  const messageText = process.argv[2] || 'MENU';
  const fromPhone = process.argv[3] || '919811022678';
  const simulatedMessageId = `wamid.HBgL${Date.now()}Simulation`;

  // 1. Simulate Inbound Text Message
  const inboundPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '987654321098765',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550269876',
                phone_number_id: '109876543210987',
              },
              contacts: [
                {
                  profile: { name: 'Parteek Test Builder' },
                  wa_id: fromPhone.replace(/\D/g, ''),
                },
              ],
              messages: [
                {
                  from: fromPhone.replace(/\D/g, ''),
                  id: simulatedMessageId,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: { body: messageText },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  await sendSignedWebhook(inboundPayload, `Inbound Message "${messageText}"`);

  // 2. Simulate Status Update (delivered)
  const statusPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '987654321098765',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550269876',
                phone_number_id: '109876543210987',
              },
              statuses: [
                {
                  id: simulatedMessageId,
                  status: 'delivered',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  recipient_id: fromPhone.replace(/\D/g, ''),
                },
              ],
            },
          },
        ],
      },
    ],
  };

  await sendSignedWebhook(statusPayload, `Delivery Status Update for ${simulatedMessageId}`);
}

main();
