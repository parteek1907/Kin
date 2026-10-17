import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/whatsapp/phone';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone') || '+919876543201'; // Default sample candidate
    const normalized = normalizePhone(phone);

    const candidate = await prisma.candidate.findUnique({
      where: { phoneE164: normalized.e164 },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      candidate: {
        ...candidate,
        skills: JSON.parse(candidate.skills || '[]'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phoneE164, discoverable, available, skills, bio, headline, isRemote, location } = body;

    const normalized = normalizePhone(phoneE164);
    if (!normalized.isValid) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const updated = await prisma.candidate.upsert({
      where: { phoneE164: normalized.e164 },
      update: {
        discoverable: Boolean(discoverable),
        available: Boolean(available),
        skills: JSON.stringify(skills || []),
        bio: bio ?? undefined,
        headline: headline ?? undefined,
        isRemote: Boolean(isRemote),
        location: location ?? undefined,
        consentGivenAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        name: body.name || 'Candidate',
        phoneE164: normalized.e164,
        headline: headline || 'Student Builder',
        institution: body.institution || 'IIIT Delhi',
        batch: body.batch || '2024',
        location: location || 'Delhi',
        isRemote: Boolean(isRemote),
        discoverable: Boolean(discoverable),
        available: Boolean(available),
        skills: JSON.stringify(skills || []),
        bio: bio || '',
        consentGivenAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      candidate: {
        ...updated,
        skills: JSON.parse(updated.skills),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
