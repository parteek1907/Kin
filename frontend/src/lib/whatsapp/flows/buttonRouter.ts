import { prisma } from '../../prisma';
import { waClient } from '../client';
import { FlowContext, FlowResult } from './types';
import { enqueueJob } from '../queue';
import { handleRequestIntro, handleIntroResponse, deliverCandidateMatches } from '../delivery';
import { findTopCandidates } from '../../matching/engine';
import { handleMenuCommand, handleMyRequirementsCommand, handleHelpCommand, handleDeleteDataCommand, handleLanguageCommand } from './commands';

export async function handleButtonOrListReply(ctx: FlowContext): Promise<FlowResult> {
  const buttonId = ctx.buttonId || ctx.listRowId;
  if (!buttonId) return { handled: false };

  const phone = ctx.contact.phoneE164;

  // 1. Requirement Confirmation Buttons
  if (buttonId === 'kin_confirm_find') {
    const state = ctx.conversationState;
    const data = state?.data ? JSON.parse(state.data) : {};
    const reqId = data.requirementId;

    if (reqId) {
      await prisma.kinRequirement.update({
        where: { id: reqId },
        data: { status: 'open' },
      });

      await waClient.sendText(
        phone,
        `🔍 *Searching campus network...* Finding the best verified talent for your requirement.`
      );

      await enqueueJob('find_and_deliver_matches', {
        requirementId: reqId,
        phoneE164: phone,
      });

      return { handled: true, clearState: true };
    }
  }

  if (buttonId === 'kin_confirm_edit') {
    await waClient.sendText(
      phone,
      `What would you like to update? Send a message with your revisions (e.g. "Also need TypeScript and prefer remote").`
    );
    return {
      handled: true,
      nextFlow: 'CLARIFYING',
      nextStep: 'AWAITING_EDIT',
      data: ctx.conversationState?.data ? JSON.parse(ctx.conversationState.data) : {},
    };
  }

  if (buttonId === 'kin_confirm_cancel') {
    const state = ctx.conversationState;
    const data = state?.data ? JSON.parse(state.data) : {};
    if (data.requirementId) {
      await prisma.kinRequirement.update({
        where: { id: data.requirementId },
        data: { status: 'closed' },
      });
    }

    await waClient.sendText(
      phone,
      `Requirement draft discarded. Send a voice note or message whenever you'd like to search again!`
    );
    return { handled: true, clearState: true };
  }

  // 2. Candidate Intro Decision Quick Replies (Candidate receiving intro request)
  if (buttonId.startsWith('intro_yes_') || buttonId.startsWith('INTRO_YES_')) {
    const matchId = buttonId.replace(/^(intro_yes_|INTRO_YES_)/, '');
    await handleIntroResponse(phone, matchId, true);
    return { handled: true };
  }

  if (buttonId.startsWith('intro_no_') || buttonId.startsWith('INTRO_NO_')) {
    const matchId = buttonId.replace(/^(intro_no_|INTRO_NO_)/, '');
    await handleIntroResponse(phone, matchId, false);
    return { handled: true };
  }

  // 3. Candidate Actions (Alumnus viewing cards)
  const candActionMatch = buttonId.match(/^req_([^_]+)_cand_([^_]+)_(intro|save|skip)$/);
  if (candActionMatch) {
    const [_, reqId, candId, action] = candActionMatch;

    if (action === 'intro') {
      const res = await handleRequestIntro(ctx.contact, reqId, candId);
      return { handled: true };
    }

    if (action === 'save') {
      await prisma.requirementMatch.updateMany({
        where: { requirementId: reqId, candidateId: candId },
        data: { status: 'saved' },
      });
      await waClient.sendText(phone, `⭐ Saved! You can review saved profiles in "MY REQUIREMENTS" anytime.`);
      return { handled: true };
    }

    if (action === 'skip') {
      await prisma.requirementMatch.updateMany({
        where: { requirementId: reqId, candidateId: candId },
        data: { status: 'skipped' },
      });
      await waClient.sendText(phone, `Candidate skipped.`);
      return { handled: true };
    }
  }

  // 4. Requirement List Options
  const reqListMatch = buttonId.match(/^req_([^_]+)_(more|edit|done)$/);
  if (reqListMatch) {
    const [_, reqId, action] = reqListMatch;
    const req = await prisma.kinRequirement.findUnique({ where: { id: reqId } });

    if (!req) {
      await waClient.sendText(phone, 'Requirement not found.');
      return { handled: true };
    }

    if (action === 'more') {
      const matches = await findTopCandidates(req, 5, 5);
      await deliverCandidateMatches(phone, req, matches);
      return { handled: true };
    }

    if (action === 'edit') {
      await waClient.sendText(
        phone,
        `Please send your updated requirement details by text or voice note.`
      );
      return {
        handled: true,
        nextFlow: 'CLARIFYING',
        nextStep: 'AWAITING_EDIT',
        data: { requirementId: reqId },
      };
    }

    if (action === 'done') {
      await waClient.sendText(
        phone,
        `✅ You're all set! We'll notify you as soon as candidates accept introductions.`
      );
      return { handled: true, clearState: true };
    }
  }

  // 5. Menu List Row Selections
  if (buttonId === 'menu_new_requirement') {
    await waClient.sendText(
      phone,
      `📝 Speak or type your requirement (role, skills, location, urgency), and KIN will find matches!`
    );
    return { handled: true };
  }

  if (buttonId === 'menu_my_requirements') {
    await handleMyRequirementsCommand(ctx.contact);
    return { handled: true };
  }

  if (buttonId === 'menu_change_language') {
    await handleLanguageCommand(ctx.contact);
    return { handled: true };
  }

  if (buttonId === 'menu_help') {
    await handleHelpCommand(ctx.contact);
    return { handled: true };
  }

  if (buttonId === 'menu_delete_data') {
    await handleDeleteDataCommand(ctx.contact);
    return { handled: true };
  }

  // 6. Data Deletion Confirmation Buttons
  if (buttonId === 'kin_confirm_delete_data') {
    const { executePermanentDataDeletion } = await import('../deletion');
    const result = await executePermanentDataDeletion(phone, 'whatsapp');
    await waClient.sendText(
      phone,
      `🔒 *Data Deletion Completed*\n\nYour personal profile, requirement listings, audio transcripts, and introduction history have been permanently erased from KIN in compliance with India's DPDP Act 2023.\n\n*Confirmation Code:* ${result.confirmationCode}\n*Timestamp:* ${result.timestamp}\n\nOnly an anonymous compliance hash was retained.`
    );
    return { handled: true, clearState: true };
  }

  if (buttonId === 'kin_cancel_delete_data') {
    await waClient.sendText(
      phone,
      `Action cancelled. Your KIN account and requirements remain active.`
    );
    return { handled: true };
  }

  // 6. Language Selection Buttons
  if (buttonId === 'lang_en' || buttonId === 'lang_hi' || buttonId === 'lang_hinglish') {
    const langMap: Record<string, string> = {
      lang_en: 'en',
      lang_hi: 'hi',
      lang_hinglish: 'hinglish',
    };
    const chosen = langMap[buttonId] || 'en';

    await prisma.whatsappContact.update({
      where: { id: ctx.contact.id },
      data: { language: chosen },
    });

    const ack =
      chosen === 'hi'
        ? 'भाषा हिंदी में सेट हो गई है।'
        : chosen === 'hinglish'
        ? 'Language Hinglish me set ho gayi hai!'
        : 'Language preference updated to English.';

    await waClient.sendText(phone, ack);
    return { handled: true };
  }

  return { handled: false };
}
