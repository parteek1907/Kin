import { prisma } from '../prisma';
import { maskPhone } from './phone';

export type JobType =
  | 'process_inbound_voice'
  | 'process_inbound_text'
  | 'find_and_deliver_matches'
  | 'dispatch_intro_request'
  | 'check_expirations_and_followup';

export interface BackgroundJobPayload {
  contactId?: string;
  phoneE164?: string;
  waMessageId?: string;
  mediaId?: string;
  text?: string;
  requirementId?: string;
  candidateId?: string;
  matchId?: string;
  extra?: Record<string, any>;
}

/**
 * Enqueues a job into the background queue with persistence in the database.
 */
export async function enqueueJob(
  jobType: JobType,
  payload: BackgroundJobPayload,
  maxAttempts = 3
): Promise<string> {
  const job = await prisma.backgroundJob.create({
    data: {
      jobType,
      payload: JSON.stringify(payload),
      status: 'pending',
      maxAttempts,
      attempts: 0,
    },
  });

  // Non-blocking trigger to process immediately in the background
  setImmediate(() => {
    runJob(job.id).catch((err) => {
      console.error(`[Queue Run Error] Job ${job.id} failed:`, err);
    });
  });

  return job.id;
}

/**
 * Executes a specific background job by ID with error tracking, retry, and dead-lettering.
 */
export async function runJob(jobId: string): Promise<boolean> {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status === 'completed' || job.status === 'dead_letter') {
    return false;
  }

  // Update status to processing
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'processing',
      attempts: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  try {
    const payload: BackgroundJobPayload = JSON.parse(job.payload);
    await executeJobHandler(job.jobType as JobType, payload);

    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        processedAt: new Date(),
        lastError: null,
      },
    });

    return true;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error(`[Queue Job ${jobId} Error] ${job.jobType}:`, errorMessage);

    const isExhausted = job.attempts + 1 >= job.maxAttempts;

    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: isExhausted ? 'dead_letter' : 'failed',
        lastError: errorMessage,
        runAt: new Date(Date.now() + Math.pow(2, job.attempts + 1) * 1000), // exponential backoff
      },
    });

    return false;
  }
}

/**
 * Retries a failed or dead-letter job (used by Admin Dashboard).
 */
export async function retryJob(jobId: string): Promise<boolean> {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'pending',
      attempts: 0,
      lastError: null,
    },
  });

  return runJob(jobId);
}

// Lazy circular import handler
async function executeJobHandler(jobType: JobType, payload: BackgroundJobPayload): Promise<void> {
  switch (jobType) {
    case 'process_inbound_voice': {
      const { processInboundVoiceJob } = await import('./flows/voiceHandler');
      await processInboundVoiceJob(payload);
      break;
    }
    case 'process_inbound_text': {
      const { processInboundTextJob } = await import('./flows/textHandler');
      await processInboundTextJob(payload);
      break;
    }
    case 'find_and_deliver_matches': {
      if (!payload.requirementId || !payload.phoneE164) {
        throw new Error('Missing requirementId or phoneE164 for find_and_deliver_matches job');
      }
      const { prisma } = await import('../prisma');
      const { findTopCandidates } = await import('../matching/engine');
      const { deliverCandidateMatches } = await import('./delivery');

      const req = await prisma.kinRequirement.findUnique({
        where: { id: payload.requirementId },
      });
      if (!req) throw new Error(`Requirement ${payload.requirementId} not found`);

      const matches = await findTopCandidates(req, 5, 0);
      await deliverCandidateMatches(payload.phoneE164, req, matches);
      break;
    }
    case 'dispatch_intro_request': {
      if (!payload.contactId || !payload.requirementId || !payload.candidateId) {
        throw new Error('Missing fields for dispatch_intro_request');
      }
      const { prisma } = await import('../prisma');
      const { handleRequestIntro } = await import('./delivery');

      const contact = await prisma.whatsappContact.findUnique({
        where: { id: payload.contactId },
      });
      if (!contact) throw new Error('Contact not found');

      await handleRequestIntro(contact, payload.requirementId, payload.candidateId);
      break;
    }
    case 'check_expirations_and_followup': {
      const { runLifecycleChecks } = await import('./lifecycle');
      await runLifecycleChecks();
      break;
    }
    default:
      console.warn(`[Queue] Unhandled jobType: ${jobType}`);
  }
}
