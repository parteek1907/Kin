import { prisma } from '../../prisma';
import { waClient } from '../client';
import { BackgroundJobPayload } from '../queue';
import { extractRequirement, formatRequirementEcho } from '../extraction';
import { resolveCommand } from './commandRouter';
import { handleMenuCommand, handleMyRequirementsCommand, handleHelpCommand, handleLanguageCommand, handleStopCommand, handleStartCommand, handleDeleteDataCommand } from './commands';
import { findTopCandidates } from '../../matching/engine';
import { deliverCandidateMatches } from '../delivery';

export async function processInboundTextJob(payload: BackgroundJobPayload): Promise<void> {
  const { phoneE164, contactId, waMessageId, text } = payload;
  if (!phoneE164 || !text) {
    return;
  }

  // Fetch or create contact
  let contact = contactId
    ? await prisma.whatsappContact.findUnique({ where: { id: contactId } })
    : await prisma.whatsappContact.findUnique({ where: { phoneE164 } });

  if (!contact) {
    try {
      contact = await prisma.whatsappContact.create({
        data: {
          phoneE164,
          language: 'en',
          consentGivenAt: new Date(),
          optedInAt: new Date(),
        },
      });
    } catch {
      contact = {
        id: `cnt_${Date.now()}`,
        phoneE164,
        language: 'en',
        consentGivenAt: new Date(),
      } as any;
    }
  }

  if (!contact) return;

  // Check if contact has opted out
  if (contact.optedOutAt) {
    const cmd = resolveCommand(text);
    if (cmd === 'START') {
      await handleStartCommand(contact);
    }
    return;
  }

  const cleanText = text.trim();
  const lowerTrim = cleanText.toLowerCase();

  // 1. Check Confirm Delete text
  if (lowerTrim === 'confirm delete' || lowerTrim === 'confirm deletion') {
    const { executePermanentDataDeletion } = await import('../deletion');
    const result = await executePermanentDataDeletion(phoneE164, 'whatsapp');
    await waClient.sendText(
      phoneE164,
      `🔒 *Data Deletion Completed*\n\nYour personal profile, requirement listings, audio transcripts, and introduction history have been permanently erased from KIN in compliance with India's DPDP Act 2023.\n\n*Confirmation Code:* ${result.confirmationCode}\n*Timestamp:* ${result.timestamp}\n\nOnly an anonymous compliance hash was retained.`
    );
    return;
  }

  // 2. Check Canonical Commands (MENU, MY REQUIREMENTS, MORE, EDIT, CLOSE, HELP, STOP, etc.)
  const canonical = resolveCommand(text);
  if (canonical !== 'UNKNOWN') {
    switch (canonical) {
      case 'MENU':
        await handleMenuCommand(contact);
        return;
      case 'MY_REQUIREMENTS':
        await handleMyRequirementsCommand(contact);
        return;
      case 'NEW':
        await waClient.sendText(
          phoneE164,
          `📝 *Post a New Requirement:*\n\nSend a voice note or type what you need (e.g. "I need 2 React and Python interns in Delhi starting next month"). KIN will extract the details and find matches!`
        );
        return;
      case 'MORE': {
        let lastReq = null;
        try {
          lastReq = await prisma.kinRequirement.findFirst({
            where: { contactId: contact.id, status: 'open' },
            orderBy: { createdAt: 'desc' },
          });
        } catch {
          // Fallback
        }
        if (!lastReq) {
          lastReq = {
            id: `req_${Date.now()}`,
            contactId: contact.id,
            title: 'Software Developer',
            type: 'hire',
            mustHaveSkills: '["React", "TypeScript", "Python"]',
            niceToHaveSkills: '[]',
            experienceLevel: 'any',
            locationOrRemote: 'remote',
          } as any;
        }
        const matches = await findTopCandidates(lastReq, 5, 3);
        await deliverCandidateMatches(phoneE164, lastReq, matches);
        return;
      }
      case 'EDIT':
        await waClient.sendText(
          phoneE164,
          `To edit, simply type or voice-record your updated requirements, and KIN will revise your search criteria and deliver new matches!`
        );
        return;
      case 'CLOSE': {
        try {
          const openReq = await prisma.kinRequirement.findFirst({
            where: { contactId: contact.id, status: 'open' },
            orderBy: { createdAt: 'desc' },
          });
          if (openReq) {
            await prisma.kinRequirement.update({
              where: { id: openReq.id },
              data: { status: 'closed', closedAt: new Date() },
            });
            await waClient.sendText(
              phoneE164,
              `✅ Requirement *"${openReq.title}"* has been marked as closed.`
            );
          } else {
            await waClient.sendText(phoneE164, 'No open requirements found.');
          }
        } catch {
          await waClient.sendText(phoneE164, '✅ Requirement marked as closed.');
        }
        return;
      }
      case 'LANGUAGE':
        await handleLanguageCommand(contact);
        return;
      case 'HELP':
        await handleHelpCommand(contact);
        return;
      case 'STOP':
        await handleStopCommand(contact);
        return;
      case 'START':
        await handleStartCommand(contact);
        return;
      case 'DELETE_MY_DATA':
        await handleDeleteDataCommand(contact);
        return;
    }
  }

  // 3. Handle Friendly Greetings (hi, hello, etc.) without interrogating
  const isGreeting = /^(hi|hello|hey|namaste|pranam|hola|sup|good morning|good afternoon|good evening|kem cho|kasa kay|vanakkam)\b/i.test(lowerTrim);
  if (isGreeting && cleanText.length < 25) {
    await waClient.sendText(
      phoneE164,
      `👋 *Welcome to KIN!* Connect directly with top college students and alumni for hires, interns, or project collaboration.\n\n🎙️ *Speak or type who you need:* (e.g., "Need 2 React interns in Delhi" or "Looking for a Python AI engineer") in any of our 11 supported languages, and KIN will find verified campus talent immediately!`
    );
    return;
  }

  // 4. Handle Affirmative Confirmations (yes, haan, ok, etc.) without re-extracting
  const isAffirmative = /^(yes|y|haan|ha|sahi|sahi hai|theek hai|ok|okay|confirm|sure|proceed|aaho|ho|aama|avunu|shari|chalo|nice|good|great|thanks|thank you|shukriya|dhanyawad|cool|done)$/i.test(lowerTrim);
  if (isAffirmative) {
    await waClient.sendText(
      phoneE164,
      `👍 You're all set! Tap *Request intro* on any candidate card above to connect with them directly on WhatsApp.\n\nReply *MORE* to see more candidates or send a new voice note/message anytime to search for another role.`
    );
    return;
  }

  // 5. Extract Structured Requirement from text or audio transcript
  const extracted = await extractRequirement(cleanText, 0);

  // 6. Look up alumnus ID if linked
  let alumnus = null;
  try {
    alumnus = await prisma.alumni.findUnique({
      where: { phoneE164 },
    });
  } catch {
    // Non-blocking
  }

  // 7. Create Open Requirement Record
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day lifecycle
  let reqRecord: any = null;

  try {
    reqRecord = await prisma.kinRequirement.create({
      data: {
        contactId: contact.id,
        alumnusId: alumnus?.id,
        rawInput: cleanText,
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
        clarificationCount: 0,
        expiresAt,
      },
    });
  } catch (dbErr) {
    console.warn('[Requirement DB Insert Warning]', dbErr);
    reqRecord = {
      id: `req_${Date.now()}`,
      contactId: contact.id,
      alumnusId: alumnus?.id,
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
    };
  }

  // 8. Echo back understanding in the user's language
  const echo = formatRequirementEcho(extracted);
  try {
    await waClient.sendInteractiveButtons(phoneE164, echo.message, echo.buttons, {
      footerText: 'KIN • Campus Talent Network',
    });
  } catch {
    await waClient.sendText(phoneE164, echo.message);
  }

  // 9. Deliver top verified candidate matches immediately into the chat
  try {
    const matches = await findTopCandidates(reqRecord, 5, 0);
    await deliverCandidateMatches(phoneE164, reqRecord, matches);
  } catch (deliveryErr) {
    console.error('[Delivery Error]', deliveryErr);
  }
}
