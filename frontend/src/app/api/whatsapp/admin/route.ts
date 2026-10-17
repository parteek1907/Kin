import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maskPhone } from '@/lib/whatsapp/phone';
import { waClient } from '@/lib/whatsapp/client';
import { retryJob } from '@/lib/whatsapp/queue';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const institutionFilter = req.nextUrl.searchParams.get('institution') || undefined;

    const [
      requirements,
      totalRequirements,
      confirmedRequirements,
      introsRequested,
      introsAccepted,
      failedJobs,
      candidatesCount,
      institutions,
    ] = await Promise.all([
      prisma.kinRequirement.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        where: institutionFilter
          ? {
              OR: [
                { alumnus: { institution: institutionFilter } },
                { contact: { institution: institutionFilter } },
              ],
            }
          : undefined,
        include: {
          alumnus: true,
          contact: true,
          matches: {
            include: { candidate: true },
          },
        },
      }),
      prisma.kinRequirement.count(),
      prisma.kinRequirement.count({ where: { status: { in: ['open', 'filled'] } } }),
      prisma.requirementMatch.count({ where: { status: { in: ['intro_requested', 'intro_accepted'] } } }),
      prisma.requirementMatch.count({ where: { status: 'intro_accepted' } }),
      prisma.backgroundJob.findMany({
        where: { status: { in: ['failed', 'dead_letter'] } },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.candidate.count(),
      prisma.candidate.groupBy({
        by: ['institution'],
        _count: { id: true },
      }),
    ]);

    // Format requirements with match quality metrics & masked phones
    const formattedRequirements = requirements.map((req) => {
      const avgScore =
        req.matches.length > 0
          ? Math.round(req.matches.reduce((sum, m) => sum + m.score, 0) / req.matches.length)
          : 0;

      return {
        id: req.id,
        title: req.title,
        type: req.type,
        alumnusName: req.alumnus?.name || req.contact.name || 'Alumnus',
        institution: req.alumnus?.institution || req.contact.institution || 'Unknown',
        phoneMasked: maskPhone(req.contact.phoneE164),
        status: req.status,
        accuracyFlag: req.accuracyFlag || 'accurate',
        matchCount: req.matches.length,
        avgMatchScore: avgScore,
        createdAt: req.createdAt,
        matches: req.matches.map((m) => ({
          candidateName: m.candidate.name,
          score: m.score,
          status: m.status,
        })),
      };
    });

    return NextResponse.json({
      funnel: {
        totalRequirements,
        confirmedRequirements,
        introsRequested,
        introsAccepted,
        conversionRate:
          totalRequirements > 0 ? Math.round((introsAccepted / totalRequirements) * 100) : 0,
      },
      candidatesCount,
      institutions: institutions.map((i) => ({ name: i.institution, count: i._count.id })),
      requirements: formattedRequirements,
      failedJobs: failedJobs.map((j) => ({
        id: j.id,
        jobType: j.jobType,
        status: j.status,
        attempts: j.attempts,
        maxAttempts: j.maxAttempts,
        lastError: j.lastError,
        updatedAt: j.updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobId, requirementId, accuracyFlag, candidateId, suspend } = body;

    // 1. Retry Background Job
    if (action === 'retry_job' && jobId) {
      const success = await retryJob(jobId);
      return NextResponse.json({ success });
    }

    // 2. Flag Requirement Accuracy
    if (action === 'flag_accuracy' && requirementId && accuracyFlag) {
      await prisma.kinRequirement.update({
        where: { id: requirementId },
        data: { accuracyFlag },
      });
      return NextResponse.json({ success: true });
    }

    // 3. Suspend / Unsuspend Candidate (Spam & abuse control)
    if (action === 'toggle_candidate_suspend' && candidateId) {
      const cand = await prisma.candidate.findUnique({ where: { id: candidateId } });
      if (!cand) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          discoverable: !cand.discoverable,
          available: !cand.available,
        },
      });
      return NextResponse.json({ success: true, suspended: cand.discoverable });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
