#!/usr/bin/env npx tsx
/**
 * Automated Test Suite for CONDUIT WhatsApp Cloud API Integration
 * Runs comprehensive unit and integration tests.
 * Usage: npx tsx scripts/wa-run-tests.ts
 */

import assert from 'assert';
import crypto from 'crypto';
import { verifyMetaSignature, checkRateLimit } from '../frontend/src/lib/whatsapp/security';
import { normalizePhone, maskPhone } from '../frontend/src/lib/whatsapp/phone';
import { isWithin24HourWindow } from '../frontend/src/lib/whatsapp/client';
import { TEMPLATES } from '../frontend/src/lib/whatsapp/templates';
import { FLOW_REGISTRY } from '../frontend/src/lib/whatsapp/flows';
import { requestPhoneOtp, verifyPhoneOtp, hashOtp } from '../frontend/src/lib/whatsapp/otp';
import { waNotifications } from '../frontend/src/lib/whatsapp/notifications';
import { prisma } from '../frontend/src/lib/prisma';
import { stopStartFlow } from '../frontend/src/lib/whatsapp/flows/stopStartFlow';

let totalTests = 0;
let passedTests = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          passedTests++;
          console.log(`  ✓ ${name}`);
        })
        .catch((err) => {
          console.error(`  ✗ ${name}`);
          console.error(err);
        });
    } else {
      passedTests++;
      console.log(`  ✓ ${name}`);
    }
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

async function main() {
  console.log('\n🧪 ========================================================');
  console.log('   CONDUIT WhatsApp Cloud API — Comprehensive Test Suite');
  console.log('========================================================\n');

  // ==========================================
  // SECTION 1: Meta Signature Verification
  // ==========================================
  console.log('--- 1. Meta Webhook Signature Verification ---');

  const secret = 'test_meta_app_secret_998877';
  const sampleBody = JSON.stringify({ object: 'whatsapp_business_account', test: true });
  const validHmac = crypto.createHmac('sha256', secret).update(sampleBody, 'utf-8').digest('hex');
  const validHeader = `sha256=${validHmac}`;

  runTest('Accepts valid HMAC-SHA256 signature', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, validHeader, secret), true);
  });

  runTest('Rejects tampered payload body', () => {
    const tampered = JSON.stringify({ object: 'whatsapp_business_account', test: false });
    assert.strictEqual(verifyMetaSignature(tampered, validHeader, secret), false);
  });

  runTest('Rejects invalid secret', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, validHeader, 'wrong_secret'), false);
  });

  runTest('Rejects missing or malformed signature header', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, null, secret), false);
    assert.strictEqual(verifyMetaSignature(sampleBody, 'invalid-format', secret), false);
  });

  // ==========================================
  // SECTION 2: Phone Normalization & Masking
  // ==========================================
  console.log('\n--- 2. Phone Normalization & Log Masking ---');

  runTest('Normalizes valid Indian numbers with +91', () => {
    const res = normalizePhone('+919811022678');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+919811022678');
    assert.strictEqual(res.digitsOnly, '919811022678');
  });

  runTest('Normalizes Indian 10-digit number without prefix', () => {
    const res = normalizePhone('9811022678', 'IN');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+919811022678');
    assert.strictEqual(res.digitsOnly, '919811022678');
  });

  runTest('Normalizes valid US number', () => {
    const res = normalizePhone('+12125551234');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+12125551234');
    assert.strictEqual(res.digitsOnly, '12125551234');
  });

  runTest('Rejects garbage and short numbers', () => {
    const res = normalizePhone('12345');
    assert.strictEqual(res.isValid, false);
  });

  runTest('Masks phone numbers cleanly for compliance logs', () => {
    const masked = maskPhone('+919811022678');
    assert.strictEqual(masked.startsWith('+91'), true);
    assert.strictEqual(masked.endsWith('2678'), true);
    assert.strictEqual(masked.includes('•'), true);
    assert.strictEqual(masked.includes('981102'), false); // middle digits concealed
  });

  // ==========================================
  // SECTION 3: 24-Hour Customer Support Window
  // ==========================================
  console.log('\n--- 3. 24-Hour Window Rule Logic ---');

  runTest('Returns true when last inbound was 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twoHoursAgo), true);
  });

  runTest('Returns false when last inbound was 25 hours ago', () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twentyFiveHoursAgo), false);
  });

  runTest('Returns false for null or undefined inbound dates', () => {
    assert.strictEqual(isWithin24HourWindow(null), false);
    assert.strictEqual(isWithin24HourWindow(undefined), false);
  });

  // ==========================================
  // SECTION 4: In-Memory Rate Limiting
  // ==========================================
  console.log('\n--- 4. Rate Limiter ---');

  runTest('Allows requests within limits and throttles upon exceeding', () => {
    const key = `test_ip_${Date.now()}`;
    const limit = 3;
    const windowSec = 10;

    assert.strictEqual(checkRateLimit(key, limit, windowSec).allowed, true);
    assert.strictEqual(checkRateLimit(key, limit, windowSec).allowed, true);
    assert.strictEqual(checkRateLimit(key, limit, windowSec).allowed, true);

    const fourth = checkRateLimit(key, limit, windowSec);
    assert.strictEqual(fourth.allowed, false);
    assert.strictEqual(fourth.remaining, 0);
    assert.strictEqual(typeof fourth.retryAfterSeconds, 'number');
  });

  // ==========================================
  // SECTION 5: Template Schema Validation
  // ==========================================
  console.log('\n--- 5. Template Parameter Validation (Zod) ---');

  runTest('Validates conduit_otp with exact 6 numeric digits', () => {
    const valid = TEMPLATES.conduit_otp.schema.safeParse({ code: '123456' });
    assert.strictEqual(valid.success, true);

    const invalidLength = TEMPLATES.conduit_otp.schema.safeParse({ code: '12345' });
    assert.strictEqual(invalidLength.success, false);

    const invalidAlpha = TEMPLATES.conduit_otp.schema.safeParse({ code: '12345A' });
    assert.strictEqual(invalidAlpha.success, false);
  });

  runTest('Validates conduit_new_match percentage within 0-100', () => {
    const valid = TEMPLATES.conduit_new_match.schema.safeParse({
      intentTitle: 'AI Research',
      matchName: 'Elena',
      fitPercentage: 92,
    });
    assert.strictEqual(valid.success, true);

    const invalidOver = TEMPLATES.conduit_new_match.schema.safeParse({
      intentTitle: 'AI Research',
      matchName: 'Elena',
      fitPercentage: 105,
    });
    assert.strictEqual(invalidOver.success, false);
  });

  // ==========================================
  // SECTION 6: Keyword Routing Logic
  // ==========================================
  console.log('\n--- 6. Inbound Keyword Router Matching ---');

  const dummyContact: any = {
    id: 'c_test_001',
    phoneE164: '+919811022678',
    verifiedAt: new Date(),
    optedInAt: new Date(),
    optedOutAt: null,
  };

  runTest('Menu flow handles MENU, HI, HELLO, and HELP case-insensitively', () => {
    const menuModule = FLOW_REGISTRY.find((f) => f.name === 'MENU');
    assert.ok(menuModule);

    assert.strictEqual(
      menuModule.canHandle({ contact: dummyContact, conversationState: null, incomingText: 'menu', waMessageId: '1' }),
      true
    );
    assert.strictEqual(
      menuModule.canHandle({ contact: dummyContact, conversationState: null, incomingText: 'Hi', waMessageId: '1' }),
      true
    );
    assert.strictEqual(
      menuModule.canHandle({ contact: dummyContact, conversationState: null, incomingText: 'HELP', waMessageId: '1' }),
      true
    );
  });

  runTest('Stop/Start flow handles STOP and START', () => {
    const stopModule = FLOW_REGISTRY.find((f) => f.name === 'STOP_START');
    assert.ok(stopModule);

    assert.strictEqual(
      stopModule.canHandle({ contact: dummyContact, conversationState: null, incomingText: 'STOP', waMessageId: '1' }),
      true
    );
    assert.strictEqual(
      stopModule.canHandle({ contact: dummyContact, conversationState: null, incomingText: 'start', waMessageId: '1' }),
      true
    );
  });

  // ==========================================
  // SECTION 7: End-to-End Integration Flow
  // ==========================================
  console.log('\n--- 7. End-to-End Phone Linking & Webhook Flow ---');

  const testPhone = `+9199999${Math.floor(10000 + Math.random() * 90000)}`;

  await runTest('1. Request OTP creates contact and returns cooldown', async () => {
    const res = await requestPhoneOtp(testPhone, 'user_integration_test');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.cooldownSeconds, 60);

    const contact = await prisma.whatsappContact.findUnique({
      where: { phoneE164: testPhone },
    });
    assert.ok(contact);
    assert.strictEqual(contact.verifiedAt, null);
  });

  await runTest('2. Rapid re-request triggers 60s cooldown error', async () => {
    try {
      await requestPhoneOtp(testPhone, 'user_integration_test');
      assert.fail('Should have thrown cooldown error');
    } catch (e: any) {
      assert.ok(e.message.includes('Please wait'));
    }
  });

  await runTest('3. Verify OTP with valid code updates verification status', async () => {
    // Read the generated OTP hash from DB
    const contact = await prisma.whatsappContact.findUnique({
      where: { phoneE164: testPhone },
    });
    const latestOtp = await prisma.whatsappOtp.findFirst({
      where: { contactId: contact!.id },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(latestOtp);

    // Find the matching 6-digit code by testing hashes
    let actualCode = '';
    for (let c = 100000; c <= 999999; c++) {
      if (hashOtp(String(c)) === latestOtp.codeHash) {
        actualCode = String(c);
        break;
      }
    }
    assert.ok(actualCode, 'Recovered test OTP code');

    const verifyRes = await verifyPhoneOtp(testPhone, actualCode, 'user_integration_test');
    assert.strictEqual(verifyRes.success, true);

    const updatedContact = await prisma.whatsappContact.findUnique({
      where: { phoneE164: testPhone },
    });
    assert.ok(updatedContact?.verifiedAt, 'verifiedAt must be populated');
    assert.ok(updatedContact?.optedInAt, 'optedInAt must be populated');
  });

  await runTest('4. Outbound notification succeeds for verified opted-in contact', async () => {
    const notifyRes = await waNotifications.notifyNewMatch({
      phoneE164: testPhone,
      intentTitle: 'Distributed Systems Kernel',
      matchName: 'Elena Rostova',
      fitPercentage: 94,
    });
    assert.ok(notifyRes);
  });

  await runTest('5. Replying STOP sets optedOutAt and suppresses notifications', async () => {
    // Inbound webhook sets lastInboundAt upon receiving the STOP message
    const contact = await prisma.whatsappContact.update({
      where: { phoneE164: testPhone },
      data: { lastInboundAt: new Date() },
    });
    assert.ok(contact);

    await stopStartFlow.handle({
      contact,
      conversationState: null,
      incomingText: 'STOP',
      waMessageId: 'simulated_stop_001',
    });

    const optedOutContact = await prisma.whatsappContact.findUnique({
      where: { id: contact.id },
    });
    assert.ok(optedOutContact?.optedOutAt, 'optedOutAt must be populated after STOP');

    // Subsequent notification must be suppressed
    const suppressedRes = await waNotifications.notifyNewMatch({
      phoneE164: testPhone,
      intentTitle: 'AI Research',
      matchName: 'Elena',
      fitPercentage: 88,
    });
    assert.strictEqual(suppressedRes, null, 'Notification must be null when contact is opted out');
  });

  // Clean up integration test contact
  await prisma.whatsappContact.deleteMany({
    where: { phoneE164: testPhone },
  });

  console.log('\n========================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed cleanly.`);
  console.log('========================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
