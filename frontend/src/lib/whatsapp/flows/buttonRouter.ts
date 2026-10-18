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

  // 1. Requirement Confirmation / Search Buttons
  if (buttonId === 'kin_confirm_find') {
    const state = ctx.conversationState;
    const data = state?.data ? JSON.parse(state.data) : {};
    let req = null;
    if (data.requirementId) {
      req = await prisma.kinRequirement.findUnique({ where: { id: data.requirementId } }).catch(() => null);
    }
    if (!req) {
      req = await prisma.kinRequirement.findFirst({
        where: { contactId: ctx.contact.id },
        orderBy: { createdAt: 'desc' },
      }).catch(() => null);
    }
    if (!req) {
      req = {
        id: `req_${Date.now()}`,
        contactId: ctx.contact.id,
        title: 'Full-Stack Developer',
        type: 'hire',
        mustHaveSkills: '["React", "TypeScript", "Python"]',
        niceToHaveSkills: '[]',
        experienceLevel: 'any',
        locationOrRemote: 'remote',
      } as any;
    }

    await waClient.sendText(
      phone,
      `🔍 *Searching campus network...* Finding verified student talent for your requirement.`
    );

    const matches = await findTopCandidates(req, 5, 0);
    await deliverCandidateMatches(phone, req, matches);
    return { handled: true, clearState: true };
  }

  if (buttonId === 'kin_confirm_edit') {
    await waClient.sendText(
      phone,
      `What would you like to update? Send a voice note or message with your revisions (e.g. "Also need TypeScript and prefer remote"), and KIN will find new matches!`
    );
    return { handled: true };
  }

  if (buttonId === 'kin_confirm_cancel') {
    await waClient.sendText(
      phone,
      `Requirement search updated. Send a voice note or message anytime describing who you need!`
    );
    return { handled: true, clearState: true };
  }

  // Handle skill buttons if previously rendered
  if (buttonId.startsWith('skill_')) {
    let skills = ['React', 'TypeScript', 'Node.js'];
    if (buttonId === 'skill_python_ai') skills = ['Python', 'PyTorch', 'FastAPI', 'AI'];
    if (buttonId === 'skill_uiux_design') skills = ['Figma', 'UI/UX', 'Design Systems', 'React'];

    let lastReq = await prisma.kinRequirement.findFirst({
      where: { contactId: ctx.contact.id },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);

    if (!lastReq) {
      lastReq = {
        id: `req_${Date.now()}`,
        contactId: ctx.contact.id,
        title: `${skills[0]} Developer`,
        type: 'hire',
        mustHaveSkills: JSON.stringify(skills),
        niceToHaveSkills: '[]',
        experienceLevel: 'any',
        locationOrRemote: 'remote',
      } as any;
    } else {
      lastReq.mustHaveSkills = JSON.stringify(skills);
    }

    if (!lastReq) return { handled: true };

    await waClient.sendText(phone, `🔍 Finding candidates with skills: *${skills.join(', ')}*...`);
    const matches = await findTopCandidates(lastReq, 5, 0);
    await deliverCandidateMatches(phone, lastReq, matches);
    return { handled: true };
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
