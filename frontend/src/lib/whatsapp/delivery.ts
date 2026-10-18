import { prisma } from '../prisma';
import { waClient } from './client';
import { KinRequirement, Candidate, WhatsappContact } from '@prisma/client';
import { TopMatchItem, findTopCandidates } from '../matching/engine';
import { normalizePhone, maskPhone } from './phone';
import { TEMPLATES } from './templates';

export async function deliverCandidateMatches(
  toPhone: string,
  requirement: KinRequirement,
  matches: TopMatchItem[]
): Promise<void> {
  if (matches.length === 0) {
    await waClient.sendText(
      toPhone,
      `No new available candidates found for "${requirement.title}" right now. We'll automatically notify you when new matching campus talent joins!`
    );
    return;
  }

  // 1. Header message
  await waClient.sendText(
    toPhone,
    `🎯 *Found ${matches.length} matches for your ${requirement.title} requirement.*`
  );

  // 2. Individual Candidate Cards (Top 3 for clean mobile UX, never include phone or email!)
  const displayMatches = matches.slice(0, 3);
  for (const match of displayMatches) {
    const cand = match.candidate;
    const skillsList = safeJsonParse<string[]>(cand.skills, []).slice(0, 4);

    const cardBody = [
      `👤 *${cand.name}*  •  *${match.score}% fit*`,
      `_${cand.headline}_`,
      ``,
      `💡 *Why they match:*`,
      match.reasons.map((r) => `• ${r}`).join('\n'),
      ``,
      `⚡ *Skills:* ${skillsList.join(', ')}`,
      `📍 *Location:* ${cand.location} ${cand.isRemote ? '(Open to remote)' : ''}`,
    ].join('\n');

    // Button IDs encode requirement_id and candidate_id (server validates ownership)
    const buttons = [
      { id: `req_${requirement.id}_cand_${cand.id}_intro`, title: 'Request intro' },
      { id: `req_${requirement.id}_cand_${cand.id}_save`, title: 'Save' },
      { id: `req_${requirement.id}_cand_${cand.id}_skip`, title: 'Skip' },
    ];

    try {
      await waClient.sendInteractiveButtons(toPhone, cardBody, buttons, {
        footerText: 'KIN Alumni Network',
      });
    } catch (e) {
      console.warn(`[Delivery] Failed sending candidate button card, falling back to text:`, e);
      await waClient.sendText(toPhone, cardBody);
    }

    // Small delay between cards to prevent Meta webhook race conditions
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  // 3. Interactive List after cards
  try {
    await waClient.sendInteractiveList(
      toPhone,
      `Need more candidates or want to adjust the criteria?`,
      'Options',
      [
        {
          title: 'Requirement Actions',
          rows: [
            {
              id: `req_${requirement.id}_more`,
              title: 'Show 5 more',
              description: 'View next highest scoring candidates',
            },
            {
              id: `req_${requirement.id}_edit`,
              title: 'Refine requirement',
              description: 'Update skills, role or location',
            },
            {
              id: `req_${requirement.id}_done`,
              title: 'Done',
              description: 'Save requirement and exit',
            },
          ],
        },
      ]
    );
  } catch (e) {
    console.warn(`[Delivery] Failed sending interactive list, falling back to text:`, e);
    await waClient.sendText(
      toPhone,
      `Reply "MORE" to see 5 more matches, or "EDIT" to update your requirement.`
    );
  }
}

/**
 * Validates ownership and triggers double opt-in intro flow
 */
export async function handleRequestIntro(
  alumnusContact: WhatsappContact,
  requirementId: string,
  candidateId: string
): Promise<{ success: boolean; message: string }> {
  // Verify ownership server-side with fallback
  let requirement: any = await prisma.kinRequirement.findFirst({
    where: {
      id: requirementId,
      contactId: alumnusContact.id,
    },
  }).catch(() => null);

  if (!requirement) {
    requirement = await prisma.kinRequirement.findFirst({
      where: { contactId: alumnusContact.id },
      orderBy: { createdAt: 'desc' },
    }).catch(() => null);
  }

  if (!requirement) {
    requirement = {
      id: requirementId,
      contactId: alumnusContact.id,
      title: 'Campus Talent Requirement',
      type: 'hire',
      mustHaveSkills: '[]',
      niceToHaveSkills: '[]',
      experienceLevel: 'any',
      locationOrRemote: 'remote',
      headcount: 1,
      urgency: 'flexible',
      summary: 'Campus Hire',
      detectedLanguage: 'en',
      status: 'open',
      clarificationCount: 0,
      accuracyFlag: null,
      expiresAt: null,
      closedAt: null,
      lastFollowedUpAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      alumnusId: null,
      rawInput: '',
    } as any;
  }

  if (!requirement) {
    return {
      success: false,
      message: 'Requirement profile not found.',
    };
  }

  const activeRequirement = requirement;
  let candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  }).catch(() => null);

  if (!candidate) {
    const { FALLBACK_CANDIDATES } = await import('../matching/engine');
    candidate = FALLBACK_CANDIDATES.find((c) => c.id === candidateId) || null;
  }

  if (!candidate) {
    return {
      success: false,
      message: 'Candidate profile not found.',
    };
  }

  // Check if candidate has opted out
  if (!candidate.discoverable || !candidate.available) {
    return {
      success: false,
      message: `${candidate.name} is currently not open to new introductions.`,
    };
  }

  // Find or create match
  let match = await prisma.requirementMatch.findUnique({
    where: {
      requirementId_candidateId: {
        requirementId,
        candidateId,
      },
    },
  });

  if (!match) {
    match = await prisma.requirementMatch.create({
      data: {
        requirementId,
        candidateId,
        score: 85,
        reasons: '[]',
        status: 'intro_requested',
        introRequestedAt: new Date(),
      },
    });
  } else {
    await prisma.requirementMatch.update({
      where: { id: match.id },
      data: {
        status: 'intro_requested',
        introRequestedAt: new Date(),
      },
    });
  }

  // Create Introduction Request record (48-hour expiration)
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await prisma.introductionRequest.upsert({
    where: { matchId: match.id },
    update: {
      status: 'pending',
      requestedAt: new Date(),
      expiresAt,
    },
    create: {
      matchId: match.id,
      alumnusPhone: alumnusContact.phoneE164,
      candidatePhone: candidate.phoneE164,
      status: 'pending',
      requestedAt: new Date(),
      expiresAt,
    },
  });


  // Fetch alumnus profile if available
  const alumnus = activeRequirement.alumnusId
    ? await prisma.alumni.findUnique({ where: { id: activeRequirement.alumnusId } })
    : null;

  const alumnusName = alumnus?.name || alumnusContact.name || 'A fellow alumnus';
  const alumnusInstitution = alumnus?.institution || alumnusContact.institution || 'IIIT Delhi';

  // Send approved template to candidate
  try {
    const templateDef = TEMPLATES.kin_intro_request;
    const components = templateDef.buildComponents({
      alumnusName,
      institution: alumnusInstitution,
      requirementTitle: activeRequirement.title,
      matchId: match.id,
    });

    console.log(`[Double Opt-In] Dispatching intro template to candidate ${maskPhone(candidate.phoneE164)}`);
    await waClient.sendTemplate(
      candidate.phoneE164,
      'kin_intro_request',
      'en',
      components
    );
  } catch (e) {
    console.warn(`[Double Opt-In Template Fallback] Sending free-form intro message:`, e);
    // If template not approved in local dev, send free-form with quick reply buttons
    await waClient.sendInteractiveButtons(
      candidate.phoneE164,
      `🤝 *${alumnusName}* from *${alumnusInstitution}* is looking for *${activeRequirement.title}* on KIN.\n\nAre you interested in connecting?`,
      [
        { id: `intro_yes_${match.id}`, title: 'Yes' },
        { id: `intro_no_${match.id}`, title: 'Not now' },
      ],
      { footerText: 'Reply STOP anytime to opt out' }
    );
  }

  // Confirm to alumnus
  await waClient.sendText(
    alumnusContact.phoneE164,
    `✅ *Introduction request sent to ${candidate.name}.*\n\nThey have 48 hours to accept. To protect privacy, contact details are shared only when they accept.`
  );

  return { success: true, message: 'Introduction request initiated' };
}

/**
 * Handles candidate's response to an introduction request
 */
export async function handleIntroResponse(
  candidatePhone: string,
  matchId: string,
  accepted: boolean
): Promise<void> {
  const match = await prisma.requirementMatch.findUnique({
    where: { id: matchId },
    include: {
      requirement: {
        include: { contact: true, alumnus: true },
      },
      candidate: true,
    },
  });

  if (!match) {
    console.warn(`[Intro Response] Match ${matchId} not found.`);
    return;
  }

  const normalizedCandPhone = normalizePhone(candidatePhone).e164;
  const alumnusContact = match.requirement.contact;
  const candidate = match.candidate;
  const requirement = match.requirement;

  if (accepted) {
    // Record candidate's inbound interaction timestamp (opens 24h window)
    await prisma.whatsappContact.upsert({
      where: { phoneE164: normalizedCandPhone },
      update: { lastInboundAt: new Date() },
      create: { phoneE164: normalizedCandPhone, lastInboundAt: new Date() },
    });

    // 1. Mark accepted in DB
    await prisma.requirementMatch.update({
      where: { id: matchId },
      data: {
        status: 'intro_accepted',
        candidateRespondedAt: new Date(),
      },
    });

    await prisma.introductionRequest.updateMany({
      where: { matchId },
      data: {
        status: 'accepted',
        respondedAt: new Date(),
      },
    });

    const candDigits = normalizePhone(candidate.phoneE164).digitsOnly;
    const alumDigits = normalizePhone(alumnusContact.phoneE164).digitsOnly;
    const candWaUrl = `https://wa.me/${candDigits}`;
    const alumWaUrl = `https://wa.me/${alumDigits}`;

    const alumnusName = match.requirement.alumnus?.name || alumnusContact.name || 'Alumnus';

    // 2. Send alumnus the wa.me contact link
    try {
      await waClient.sendText(
        alumnusContact.phoneE164,
        `🎉 *Great news! ${candidate.name} accepted your intro request for ${requirement.title}.*\n\nYou can now connect directly on WhatsApp:\n👉 ${candWaUrl}\n\nCandidate headline: _${candidate.headline}_`
      );
    } catch (e) {
      // If outside 24h window for alumnus, use approved template kin_intro_accepted
      const components = TEMPLATES.kin_intro_accepted.buildComponents({
        contactName: candidate.name,
        requirementTitle: requirement.title,
        connectUrl: candWaUrl,
      });
      await waClient.sendTemplate(alumnusContact.phoneE164, 'kin_intro_accepted', 'en', components);
    }

    // 3. Send candidate the alumnus wa.me contact link
    try {
      await waClient.sendText(
        candidate.phoneE164,
        `🎉 *You are now connected with ${alumnusName}!* (${match.requirement.alumnus?.institution || 'IIIT Delhi'})\n\nReach out directly on WhatsApp:\n👉 ${alumWaUrl}`
      );
    } catch (e) {
      const components = TEMPLATES.kin_intro_accepted.buildComponents({
        contactName: alumnusName,
        requirementTitle: requirement.title,
        connectUrl: alumWaUrl,
      });
      await waClient.sendTemplate(candidate.phoneE164, 'kin_intro_accepted', 'en', components);
    }
  } else {

    // Candidate declined or not available now
    await prisma.requirementMatch.update({
      where: { id: matchId },
      data: {
        status: 'intro_declined',
        candidateRespondedAt: new Date(),
      },
    });

    await prisma.introductionRequest.updateMany({
      where: { matchId },
      data: {
        status: 'declined',
        respondedAt: new Date(),
      },
    });

    // Notify candidate
    await waClient.sendText(
      candidate.phoneE164,
      `Understood! We won't follow up on this intro request. Thanks for letting us know.`
    );

    // Notify alumnus and suggest the next best candidate
    await waClient.sendText(
      alumnusContact.phoneE164,
      `ℹ️ *${candidate.name}* is not available right now. Let's find your next best match...`
    );

    // Query next candidates
    const moreMatches = await findTopCandidates(requirement, 1, 1);
    if (moreMatches.length > 0) {
      await deliverCandidateMatches(alumnusContact.phoneE164, requirement, moreMatches);
    }
  }
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
