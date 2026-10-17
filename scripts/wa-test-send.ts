#!/usr/bin/env npx tsx
/**
 * Test script to send a Meta WhatsApp template message.
 * Usage: npx tsx scripts/wa-test-send.ts <phone_number> [template_name]
 * Example: npx tsx scripts/wa-test-send.ts +919811022678 hello_world
 */

import { waClient } from '../frontend/src/lib/whatsapp/client';
import { normalizePhone, maskPhone } from '../frontend/src/lib/whatsapp/phone';

async function main() {
  const targetPhone = process.argv[2];
  const templateName = process.argv[3] || 'hello_world';

  if (!targetPhone) {
    console.error('❌ Error: Recipient phone number required.');
    console.log('Usage: npx tsx scripts/wa-test-send.ts <phone_number> [template_name]');
    process.exit(1);
  }

  const normalized = normalizePhone(targetPhone);
  if (!normalized.isValid) {
    console.error(`❌ Error: Invalid phone number: ${normalized.error}`);
    process.exit(1);
  }

  console.log(`🚀 Dispatching WhatsApp template '${templateName}' to ${maskPhone(normalized.e164)}...`);

  try {
    const result = await waClient.sendTemplate(
      normalized.e164,
      templateName,
      'en_US',
      []
    );
    console.log(`✅ Success! WhatsApp message dispatched.`);
    console.log(`   Message ID: ${result.messageId || 'N/A'}`);
  } catch (err: any) {
    console.error(`❌ WhatsApp Dispatch Failed:`, err.message);
    if (err.details) {
      console.error(`   Details:`, JSON.stringify(err.details, null, 2));
    }
    process.exit(1);
  }
}

main();
