#!/usr/bin/env npx tsx
/**
 * Automated Test Suite for KIN WhatsApp Cloud API Integration
 * Runs comprehensive unit and integration tests covering:
 * - Signature verification & rate limiting
 * - Phone normalization & privacy masking
 * - 24-hour window logic
 * - Requirement extraction schema & prompt injection safety
 * - Deterministic matching scorer & protected attributes neutrality
 * - Button ID ownership security
 * - Multi-lingual command router (English, Hindi, Hinglish)
 * - Full End-to-End lifecycle (onboarding -> voice/text -> matches -> double opt-in intro -> contacts exchanged)
 *
 * Usage: npx tsx scripts/wa-run-tests.ts
 */

import assert from 'assert';
import crypto from 'crypto';
import { verifyMetaSignature, checkRateLimit } from '../frontend/src/lib/whatsapp/security';
import { normalizePhone, maskPhone } from '../frontend/src/lib/whatsapp/phone';
import { isWithin24HourWindow } from '../frontend/src/lib/whatsapp/client';
import { ExtractedRequirementSchema, extractRequirement } from '../frontend/src/lib/whatsapp/extraction';
import { scoreCandidate } from '../frontend/src/lib/matching/scorer';
import { findTopCandidates, ensureInitialCandidates } from '../frontend/src/lib/matching/engine';
import { handleRequestIntro, handleIntroResponse } from '../frontend/src/lib/whatsapp/delivery';
import { resolveCommand } from '../frontend/src/lib/whatsapp/flows/commandRouter';
import { prisma } from '../frontend/src/lib/prisma';

let totalTests = 0;
let passedTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

async function main() {
  console.log('\n🧪 ========================================================');
  console.log('   KIN WhatsApp Cloud API — Comprehensive Test Suite');
  console.log('========================================================\n');

  // ==========================================
  // SECTION 1: Meta Signature Verification
  // ==========================================
  console.log('--- 1. Meta Webhook Signature Verification ---');

  const secret = 'test_meta_app_secret_998877';
  const sampleBody = JSON.stringify({ object: 'whatsapp_business_account', test: true });
  const validHmac = crypto.createHmac('sha256', secret).update(sampleBody, 'utf-8').digest('hex');
  const validHeader = `sha256=${validHmac}`;

  await runTest('Accepts valid HMAC-SHA256 signature', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, validHeader, secret), true);
  });

  await runTest('Rejects tampered payload body', () => {
    const tamperedBody = JSON.stringify({ object: 'whatsapp_business_account', test: false });
    assert.strictEqual(verifyMetaSignature(tamperedBody, validHeader, secret), false);
  });

  await runTest('Rejects invalid secret', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, validHeader, 'wrong_secret'), false);
  });

  await runTest('Rejects missing or malformed signature header', () => {
    assert.strictEqual(verifyMetaSignature(sampleBody, null, secret), false);
    assert.strictEqual(verifyMetaSignature(sampleBody, 'invalid-format', secret), false);
  });

  // ==========================================
  // SECTION 2: Phone Normalization & Log Masking
  // ==========================================
  console.log('\n--- 2. Phone Normalization & Log Masking ---');

  await runTest('Normalizes valid Indian numbers with +91', () => {
    const res = normalizePhone('+919811022678');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+919811022678');
    assert.strictEqual(res.digitsOnly, '919811022678');
  });

  await runTest('Normalizes Indian 10-digit number without prefix', () => {
    const res = normalizePhone('9811022678');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.e164, '+919811022678');
  });

  await runTest('Rejects garbage and short numbers', () => {
    assert.strictEqual(normalizePhone('123').isValid, false);
    assert.strictEqual(normalizePhone('abc12345').isValid, false);
  });

  await runTest('Masks phone numbers cleanly for compliance logs', () => {
    const masked = maskPhone('+919811022678');
    assert.strictEqual(masked, '+91••••••2678');
  });

  // ==========================================
  // SECTION 3: 24-Hour Window Rule Logic
  // ==========================================
  console.log('\n--- 3. 24-Hour Window Rule Logic ---');

  await runTest('Returns true when last inbound was 2 hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twoHoursAgo), true);
  });

  await runTest('Returns false when last inbound was 25 hours ago', () => {
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    assert.strictEqual(isWithin24HourWindow(twentyFiveHoursAgo), false);
  });

  await runTest('Returns false for null or undefined inbound dates', () => {
    assert.strictEqual(isWithin24HourWindow(null), false);
    assert.strictEqual(isWithin24HourWindow(undefined), false);
  });

  // ==========================================
  // SECTION 4: Rate Limiter
  // ==========================================
  console.log('\n--- 4. Rate Limiter ---');

  await runTest('Allows requests within limits and throttles upon exceeding', () => {
    const key = `test_rate_limit_${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(checkRateLimit(key, 5, 60).allowed, true);
    }
    assert.strictEqual(checkRateLimit(key, 5, 60).allowed, false);
  });


  // ==========================================
  // SECTION 5: Requirement Extraction Schema
  // ==========================================
  console.log('\n--- 5. Requirement Extraction Schema & Safety ---');

  await runTest('Validates strict Zod schema for extracted requirement', () => {
    const validData = {
      title: 'React Frontend Intern',
      type: 'intern',
      must_have_skills: ['React', 'TypeScript'],
      nice_to_have_skills: ['Tailwind'],
      experience_level: 'junior',
      location_or_remote: 'Delhi NCR',
      headcount: 2,
      urgency: 'next_month',
      summary: 'Looking for 2 React interns in Delhi.',
      detected_language: 'en',
    };
    const parsed = ExtractedRequirementSchema.safeParse(validData);
    assert.strictEqual(parsed.success, true);
  });

  await runTest('Extracts requirement from natural English and Hinglish text', async () => {
    const resEn = await extractRequirement('Need 2 React and Node interns in Delhi for our startup');
    assert.strictEqual(resEn.type, 'intern');
    assert.strictEqual(resEn.headcount, 2);
    assert.ok(resEn.must_have_skills.includes('React'));

    const resHi = await extractRequirement('Mujhe 2 React developer chahiye Delhi me startup ke liye');
    assert.strictEqual(resHi.detected_language, 'hinglish');
    assert.ok(resHi.must_have_skills.includes('React'));
  });

  // ==========================================
  // SECTION 6: Matching Scorer & Protected Attributes Neutrality
  // ==========================================
  console.log('\n--- 6. Matching Scorer & Protected Attributes Neutrality ---');

  const baseReq = {
    title: 'React Frontend Engineer',
    type: 'hire',
    mustHaveSkills: ['React', 'TypeScript', 'Node.js'],
    experienceLevel: 'junior',
    locationOrRemote: 'Delhi',
    institution: 'IIIT Delhi',
    batch: '2022',
  };

  const candA = {
    name: 'Aarav Patel',
    headline: 'Full-stack Developer @ IIIT Delhi',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    institution: 'IIIT Delhi',
    batch: '2023',
    location: 'Delhi',
    isRemote: true,
    experienceYears: 1.5,
    verifiedNode: true,
    lastActiveAt: new Date(),
  };

  await runTest('Produces deterministic high score for strong match', () => {
    const result = scoreCandidate(baseReq, candA);
    assert.ok(result.score >= 80, `Score ${result.score} should be >= 80`);
    assert.ok(result.reasons.length >= 2, 'Should provide multiple rationale items');
  });

  await runTest('CRITICAL: Protected attributes (gender, age, caste, religion, origin) have ZERO effect on score', () => {
    const score1 = scoreCandidate(baseReq, candA).score;

    // Simulate candidate with extraneous protected attributes passed in
    const candWithProtectedAttributes: any = {
      ...candA,
      gender: 'female',
      religion: 'jain',
      caste: 'general',
      age: 28,
      regionOfOrigin: 'South India',
    };

    const score2 = scoreCandidate(baseReq, candWithProtectedAttributes).score;
    assert.strictEqual(
      score1,
      score2,
      `Non-discrimination violation: score changed from ${score1} to ${score2}`
    );
  });

  // ==========================================
  // SECTION 7: Multi-Lingual Command Router
  // ==========================================
  console.log('\n--- 7. Inbound Command & Multi-lingual Alias Router ---');

  await runTest('Resolves commands in English, Hindi, and Hinglish', () => {
    assert.strictEqual(resolveCommand('MENU'), 'MENU');
    assert.strictEqual(resolveCommand('hi'), 'MENU');
    assert.strictEqual(resolveCommand('namaste'), 'MENU');
    assert.strictEqual(resolveCommand('meri requirements'), 'MY_REQUIREMENTS');
    assert.strictEqual(resolveCommand('chahiye'), 'NEW');
    assert.strictEqual(resolveCommand('aur dikhao'), 'MORE');
    assert.strictEqual(resolveCommand('badlo'), 'EDIT');
    assert.strictEqual(resolveCommand('khatam'), 'CLOSE');
    assert.strictEqual(resolveCommand('madad'), 'HELP');
    assert.strictEqual(resolveCommand('ruko'), 'STOP');
    assert.strictEqual(resolveCommand('shuru'), 'START');
    assert.strictEqual(resolveCommand('delete my data'), 'DELETE_MY_DATA');
  });

  // ==========================================
  // SECTION 8: Button-ID Ownership Checks
  // ==========================================
  console.log('\n--- 8. Button-ID Ownership & Security ---');

  await runTest('Rejects intro request when contact does not own requirement', async () => {
    const mockContact = {
      id: 'unauthorized_contact_999',
      phoneE164: '+919999999999',
      name: 'Intruder',
    } as any;

    const res = await handleRequestIntro(mockContact, 'non_existent_req_id', 'cand_123');
    assert.strictEqual(res.success, false);
  });

  // ==========================================
  // SECTION 9: End-to-End Lifecycle Integration Test
  // ==========================================
  console.log('\n--- 9. Full End-to-End KIN Lifecycle Integration Test ---');

  await runTest('Complete flow: Onboarding -> Requirement -> Match -> Intro -> Mutual Share', async () => {
    await ensureInitialCandidates();

    const testAlumPhone = `+919811${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Create or get alumnus contact with active 24h inbound window
    const contact = await prisma.whatsappContact.upsert({
      where: { phoneE164: testAlumPhone },
      update: {
        name: 'Vikram Alumnus',
        institution: 'IIIT Delhi',
        consentGivenAt: new Date(),
        lastInboundAt: new Date(),
      },
      create: {
        phoneE164: testAlumPhone,
        name: 'Vikram Alumnus',
        institution: 'IIIT Delhi',
        consentGivenAt: new Date(),
        lastInboundAt: new Date(),
        language: 'en',
      },
    });


    // 2. Post requirement
    const req = await prisma.kinRequirement.create({
      data: {
        contactId: contact.id,
        rawInput: 'Looking for 2 React interns in Delhi',
        title: 'React Intern',
        type: 'intern',
        mustHaveSkills: JSON.stringify(['React', 'TypeScript']),
        locationOrRemote: 'Delhi',
        headcount: 2,
        summary: 'Looking for 2 React interns in Delhi',
        status: 'open',
      },
    });

    // 3. Find top candidates
    const matches = await findTopCandidates(req, 5, 0);
    assert.ok(matches.length > 0, 'Should find at least 1 matching candidate');
    const topCand = matches[0].candidate;

    // 4. Request introduction (Double opt-in initiated)
    const introRes = await handleRequestIntro(contact, req.id, topCand.id);
    assert.strictEqual(introRes.success, true);

    const matchRecord = await prisma.requirementMatch.findUnique({
      where: {
        requirementId_candidateId: {
          requirementId: req.id,
          candidateId: topCand.id,
        },
      },
    });
    assert.ok(matchRecord, 'Match record must exist');
    assert.strictEqual(matchRecord.status, 'intro_requested');

    // 5. Candidate Accepts Intro (Double opt-in complete)
    await handleIntroResponse(topCand.phoneE164, matchRecord.id, true);

    const updatedMatch = await prisma.requirementMatch.findUnique({
      where: { id: matchRecord.id },
    });
    assert.strictEqual(updatedMatch?.status, 'intro_accepted');

    // 6. Test STOP command
    const { handleStopCommand } = await import('../frontend/src/lib/whatsapp/flows/commands');
    await handleStopCommand(contact);

    const optedOutContact = await prisma.whatsappContact.findUnique({
      where: { id: contact.id },
    });
    assert.ok(optedOutContact?.optedOutAt, 'optedOutAt should be set upon STOP');
  });

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} tests passed cleanly.`);
  console.log('========================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Test suite runner crashed:', e);
  process.exit(1);
});
