import { prisma } from '../../prisma';
import { waClient } from '../client';
import { BackgroundJobPayload, enqueueJob } from '../queue';
import { extractRequirement, formatRequirementEcho, ExtractedRequirement } from '../extraction';
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
    contact = await prisma.whatsappContact.create({
      data: { phoneE164, language: 'en' },
    });
  }

  // Check if contact has opted out
  if (contact.optedOutAt) {
    const cmd = resolveCommand(text);
    if (cmd === 'START') {
      await handleStartCommand(contact);
    }
    // If opted out and not sending START, silence outbound
    return;
  }

  // 1. Check Confirm Delete text
  const cleanText = text.trim().toLowerCase();
  if (cleanText === 'confirm delete' || cleanText === 'confirm deletion') {
    const { executePermanentDataDeletion } = await import('../deletion');
    const result = await executePermanentDataDeletion(phoneE164, 'whatsapp');
    await waClient.sendText(
      phoneE164,
      `🔒 *Data Deletion Completed*\n\nYour personal profile, requirement listings, audio transcripts, and introduction history have been permanently erased from KIN in compliance with India's DPDP Act 2023.\n\n*Confirmation Code:* ${result.confirmationCode}\n*Timestamp:* ${result.timestamp}\n\nOnly an anonymous compliance hash was retained.`
    );
    return;
  }

  // 2. Check Canonical Commands
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
        const lastReq = await prisma.kinRequirement.findFirst({
          where: { contactId: contact.id, status: 'open' },
          orderBy: { createdAt: 'desc' },
        });
        if (!lastReq) {
          await waClient.sendText(phoneE164, 'You have no open requirements right now. Reply "NEW" to post one!');
          return;
        }
        const matches = await findTopCandidates(lastReq, 5, 5);
        await deliverCandidateMatches(phoneE164, lastReq, matches);
        return;
      }
      case 'EDIT':
        await waClient.sendText(
          phoneE164,
          `To edit, simply type or voice-record your updated requirements, and KIN will revise your search criteria.`
        );
        return;
      case 'CLOSE': {
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

  // 2. Check Daily Requirement Limit (Max 10 per day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const reqCountToday = await prisma.kinRequirement.count({
    where: {
      contactId: contact.id,
      createdAt: { gte: todayStart },
    },
  });

  if (reqCountToday >= 10) {
    await waClient.sendText(
      phoneE164,
      `⚠️ You have reached the limit of 10 requirements per day. Please check back tomorrow or review your active requirements by replying "MY REQUIREMENTS".`
    );
    return;
  }

  // 3. Check Conversation State for Clarification in flight
  const convState = await prisma.whatsappConversationState.findUnique({
    where: { contactId: contact.id },
  });

  let clarificationCount = 0;
  let combinedInput = text;

  if (convState && convState.flow === 'CLARIFYING') {
    const prevData = safeJsonParse<any>(convState.data, {});
    combinedInput = `${prevData.rawInput || ''} ${text}`;
    clarificationCount = (prevData.clarificationCount || 0) + 1;
  }

  // 4. Extract Structured Requirement
  const extracted = await extractRequirement(combinedInput, clarificationCount);

  // If critical fields still missing and clarifying is needed
  if (extracted.needs_clarification && clarificationCount < 2) {
    await prisma.whatsappConversationState.upsert({
      where: { contactId: contact.id },
      update: {
        flow: 'CLARIFYING',
        step: extracted.missing_field,
        data: JSON.stringify({
          rawInput: combinedInput,
          clarificationCount,
          extracted,
        }),
      },
      create: {
        contactId: contact.id,
        flow: 'CLARIFYING',
        step: extracted.missing_field,
        data: JSON.stringify({
          rawInput: combinedInput,
          clarificationCount,
          extracted,
        }),
      },
    });

    if (extracted.clarification_buttons && extracted.clarification_buttons.length > 0) {
      await waClient.sendInteractiveButtons(
        phoneE164,
        extracted.clarification_question || 'Which skill are you looking for?',
        extracted.clarification_buttons.slice(0, 3)
      );
    } else {
      await waClient.sendText(
        phoneE164,
        extracted.clarification_question || 'Could you specify the skills or role needed?'
      );
    }
    return;
  }

  // 5. Look up alumnus ID if linked
  const alumnus = await prisma.alumni.findUnique({
    where: { phoneE164 },
  });

  // 6. Create Draft Requirement in DB
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-day auto-close lifecycle
  const reqRecord = await prisma.kinRequirement.create({
    data: {
      contactId: contact.id,
      alumnusId: alumnus?.id,
      rawInput: combinedInput,
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
      status: 'draft',
      clarificationCount,
      expiresAt,
    },
  });

  // 7. Store confirmation state
  await prisma.whatsappConversationState.upsert({
    where: { contactId: contact.id },
    update: {
      flow: 'CONFIRMING',
      step: 'AWAITING_CONFIRMATION',
      data: JSON.stringify({ requirementId: reqRecord.id }),
    },
    create: {
      contactId: contact.id,
      flow: 'CONFIRMING',
      step: 'AWAITING_CONFIRMATION',
      data: JSON.stringify({ requirementId: reqRecord.id }),
    },
  });

  // 8. Echo back understanding in the user's language
  const echo = formatRequirementEcho(extracted);
  await waClient.sendInteractiveButtons(phoneE164, echo.message, echo.buttons, {
    footerText: 'KIN • Campus Talent Network',
  });
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
