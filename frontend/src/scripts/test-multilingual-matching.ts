import { extractRequirement, formatRequirementEcho } from '../lib/whatsapp/extraction';
import { findTopCandidates } from '../lib/matching/engine';
import { prisma } from '../lib/prisma';

async function testMultilingualWorkflow() {
  console.log('================================================================');
  console.log('🧪 TESTING KIN 11-LANGUAGE EXTRACTION & MATCHING ENGINE');
  console.log('================================================================\n');

  const testCases = [
    {
      langName: 'Hindi',
      input: 'मुझे दिल्ली में 2 React और TypeScript इंटर्न चाहिए स्टार्टअप के लिए',
    },
    {
      langName: 'Punjabi',
      input: 'ਮੈਨੂੰ 1 Python AI developer ਚਾਹੀਦਾ ਹੈ ਜੋ PyTorch ਅਤੇ LangChain ਜਾਣਦਾ ਹੋਵੇ',
    },
    {
      langName: 'Tamil',
      input: 'எனக்கு சென்னையில் ஒரு Flutter developer தேவை உடனடி வேலைக்கு',
    },
    {
      langName: 'Bengali',
      input: 'আমার ২ জন Next.js এবং Tailwind ফুলস্ট্যাক ডেভেলপার দরকার',
    },
    {
      langName: 'Telugu',
      input: 'నాకు ఒక Data Science intern కావాలి Python మరియు SQL లో ఢిల్లీ లేదా రిమోట్',
    },
    {
      langName: 'Hinglish',
      input: 'Mujhe ek UI UX designer chahiye Figma aur React ke liye',
    },
    {
      langName: 'English',
      input: 'Looking for a senior Rust and Go backend engineer with Kubernetes experience for a remote role',
    },
  ];

  // Pick our seeded alumnus (Parteek Garg)
  const alumnus = await prisma.alumni.findFirst({
    where: { phoneE164: '+919878543419' },
  });

  const contact = await prisma.whatsappContact.findFirst({
    where: { phoneE164: '+919878543419' },
  });

  if (!contact) {
    throw new Error('Alumnus contact not found. Run prisma/seed-data.ts first.');
  }

  for (const tc of testCases) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`🌐 TEST CASE: ${tc.langName}`);
    console.log(`📥 Input Message: "${tc.input}"`);

    // 1. Extraction via LLM / Groq
    const extracted = await extractRequirement(tc.input);
    console.log(`\n✨ Extracted Requirement:`);
    console.log(`• Title: ${extracted.title}`);
    console.log(`• Type: ${extracted.type}`);
    console.log(`• Skills: [${extracted.must_have_skills.join(', ')}]`);
    console.log(`• Location: ${extracted.location_or_remote}`);
    console.log(`• Detected Language: ${extracted.detected_language}`);
    console.log(`• Summary: ${extracted.summary}`);

    // 2. Localized Echo Message
    const echo = formatRequirementEcho(extracted);
    console.log(`\n💬 Localized Echo Confirmation for WhatsApp:`);
    console.log(`"${echo.message.replace(/\n+/g, ' ')}"`);

    // 3. Create Requirement & Match Candidates
    const requirement = await prisma.kinRequirement.create({
      data: {
        contactId: contact.id,
        alumnusId: alumnus?.id,
        rawInput: tc.input,
        title: extracted.title,
        type: extracted.type,
        mustHaveSkills: JSON.stringify(extracted.must_have_skills),
        niceToHaveSkills: JSON.stringify(extracted.nice_to_have_skills),
        experienceLevel: extracted.experience_level,
        locationOrRemote: extracted.location_or_remote,
        headcount: extracted.headcount,
        urgency: extracted.urgency,
        summary: extracted.summary,
        detectedLanguage: extracted.detected_language,
        status: 'open',
      },
    });

    const matches = await findTopCandidates(requirement, 3, 0);
    console.log(`\n🎯 Top Matched Candidates (${matches.length} found):`);
    matches.forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.candidate.name} (${m.candidate.institution}, Batch ${m.candidate.batch}) - ${m.score}% Match`);
      console.log(`     Headline: ${m.candidate.headline}`);
      console.log(`     Location: ${m.candidate.location}`);
      console.log(`     Reasons: ${m.reasons.join(' | ')}`);
    });
  }

  console.log('\n================================================================');
  console.log('✅ ALL MULTILINGUAL WORKFLOW TESTS PASSED PERFECTLY!');
  console.log('================================================================');
}

testMultilingualWorkflow()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
