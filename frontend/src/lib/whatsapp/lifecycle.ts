import { prisma } from '../prisma';
import { waClient, isWithin24HourWindow } from './client';
import { TEMPLATES } from './templates';
import { findTopCandidates } from '../matching/engine';
import { deliverCandidateMatches } from './delivery';
import { maskPhone } from './phone';

export async function runLifecycleChecks(): Promise<{
  autoClosedRequirements: number;
  expiredIntros: number;
  followupsSent: number;
}> {
  const now = new Date();

  // 1. Auto-close after 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const autoCloseResult = await prisma.kinRequirement.updateMany({
    where: {
      status: 'open',
      createdAt: { lte: thirtyDaysAgo },
    },
    data: {
      status: 'closed',
      closedAt: now,
    },
  });

  // 2. 48-Hour Intro Request Expiration Check
  const expiredIntros = await prisma.introductionRequest.findMany({
    where: {
      status: 'pending',
      expiresAt: { lte: now },
    },
    include: {
      match: {
        include: {
          requirement: { include: { contact: true } },
          candidate: true,
        },
      },
    },
  });

  let expiredCount = 0;
  for (const intro of expiredIntros) {
    await prisma.introductionRequest.update({
      where: { id: intro.id },
      data: { status: 'expired' },
    });

    await prisma.requirementMatch.update({
      where: { id: intro.matchId },
      data: { status: 'expired' },
    });

    const contact = intro.match.requirement.contact;
    const candName = intro.match.candidate.name;

    // Inform alumnus of 48h timeout and offer next best candidate
    await waClient.sendText(
      contact.phoneE164,
      `⌛ *Intro request expired:* ${candName} was unavailable or did not respond within 48 hours.\n\nLet's check the next best candidates:`
    );

    const nextMatches = await findTopCandidates(intro.match.requirement, 1, 1);
    if (nextMatches.length > 0) {
      await deliverCandidateMatches(contact.phoneE164, intro.match.requirement, nextMatches);
    }
    expiredCount++;
  }

  // 3. 3-Day Follow-Up
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const openFollowupCandidates = await prisma.kinRequirement.findMany({
    where: {
      status: 'open',
      createdAt: { lte: threeDaysAgo },
      lastFollowedUpAt: null,
    },
    include: {
      contact: true,
      alumnus: true,
    },
    take: 20,
  });

  let followupsCount = 0;
  for (const req of openFollowupCandidates) {
    const contact = req.contact;
    const alumnusName = req.alumnus?.name || contact.name || 'Alumnus';

    try {
      if (isWithin24HourWindow(contact.lastInboundAt)) {
        await waClient.sendInteractiveButtons(
          contact.phoneE164,
          `Hi ${alumnusName}, did you connect with someone for your *${req.title}* requirement?`,
          [
            { id: `followup_yes_${req.id}`, title: 'Yes' },
            { id: `followup_no_${req.id}`, title: 'No' },
            { id: `followup_more_${req.id}`, title: 'Need more' },
          ]
        );
      } else {
        // Outside 24h window: strictly use approved template kin_followup
        const templateDef = TEMPLATES.kin_followup;
        const components = templateDef.buildComponents({
          alumnusName,
          requirementTitle: req.title,
          requirementId: req.id,
        });

        await waClient.sendTemplate(contact.phoneE164, 'kin_followup', 'en', components);
      }

      await prisma.kinRequirement.update({
        where: { id: req.id },
        data: { lastFollowedUpAt: now },
      });
      followupsCount++;
    } catch (e) {
      console.warn(`[Follow-up] Failed sending follow-up for requirement ${req.id}:`, e);
    }
  }

  return {
    autoClosedRequirements: autoCloseResult.count,
    expiredIntros: expiredCount,
    followupsSent: followupsCount,
  };
}
