import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'student' | 'professional' | 'alumni' | 'all'
    const search = searchParams.get('search')?.trim().toLowerCase();
    const currentUserEmail = searchParams.get('currentUserEmail');

    // Build where clause
    const where: any = {};
    if (role && role !== 'all') {
      if (role === 'professional' || role === 'alumni') {
        where.role = { in: ['professional', 'alumni'] };
      } else {
        where.role = role;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { headline: { contains: search } },
        { institution: { contains: search } },
        { skills: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        sentConnections: {
          select: {
            id: true,
            receiverId: true,
            status: true,
          },
        },
        receivedConnections: {
          select: {
            id: true,
            senderId: true,
            status: true,
          },
        },
      },
    });

    // Determine current user ID if email is provided
    let currentMemberId: string | null = null;
    if (currentUserEmail) {
      const currentMember = await prisma.member.findUnique({
        where: { email: currentUserEmail },
        select: { id: true },
      });
      if (currentMember) {
        currentMemberId = currentMember.id;
      }
    }

    // Format member records and determine connection state
    const formatted = members.map((m) => {
      let connectionStatus: 'none' | 'pending' | 'connected' | 'self' = 'none';
      let connectionId: string | null = null;

      if (currentMemberId) {
        if (m.id === currentMemberId) {
          connectionStatus = 'self';
        } else {
          // Check sent
          const sent = m.receivedConnections.find((c) => c.senderId === currentMemberId);
          if (sent) {
            connectionStatus = sent.status === 'accepted' ? 'connected' : 'pending';
            connectionId = sent.id;
          } else {
            // Check received
            const received = m.sentConnections.find((c) => c.receiverId === currentMemberId);
            if (received) {
              connectionStatus = received.status === 'accepted' ? 'connected' : 'pending';
              connectionId = received.id;
            }
          }
        }
      }

      let parsedSkills: string[] = [];
      try {
        parsedSkills = typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills;
      } catch {
        parsedSkills = m.skills ? [m.skills] : [];
      }

      return {
        id: m.id,
        email: m.email,
        name: m.name,
        role: m.role,
        headline: m.headline || (m.role === 'student' ? 'Student Builder' : 'Senior Systems Architect'),
        institution: m.institution,
        verificationStatus: m.verificationStatus,
        bio: m.bio,
        skills: parsedSkills,
        linkedinUrl: m.linkedinUrl,
        githubUrl: m.githubUrl,
        githubUsername: m.githubUsername,
        portfolioUrl: m.portfolioUrl,
        topProjectUrl: m.topProjectUrl,
        topProjectDescription: m.topProjectDescription,
        officeHours: m.officeHours,
        graduationYear: m.graduationYear,
        avatarUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        connectionStatus,
        connectionId,
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      total: formatted.length,
      members: formatted,
    });
  } catch (error: any) {
    console.error('[API /api/members GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      role = 'student',
      headline,
      institution,
      studentId,
      businessId,
      bio,
      skills = [],
      linkedinUrl,
      githubUrl,
      githubUsername,
      portfolioUrl,
      resumeName,
      graduationYear,
      officeHours,
      topProjectUrl,
      topProjectDescription,
      avatarUrl,
    } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Email and name are required' }, { status: 400 });
    }

    const skillsString = Array.isArray(skills)
      ? JSON.stringify(skills)
      : typeof skills === 'string'
      ? JSON.stringify(skills.split(',').map((s) => s.trim()).filter(Boolean))
      : '[]';

    const member = await prisma.member.upsert({
      where: { email },
      update: {
        name,
        role,
        headline,
        institution,
        studentId: studentId ?? undefined,
        businessId: businessId ?? undefined,
        bio: bio ?? undefined,
        skills: skillsString,
        linkedinUrl: linkedinUrl ?? undefined,
        githubUrl: githubUrl ?? undefined,
        githubUsername: githubUsername ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        resumeName: resumeName ?? undefined,
        graduationYear: graduationYear ?? undefined,
        officeHours: officeHours ?? undefined,
        topProjectUrl: topProjectUrl ?? undefined,
        topProjectDescription: topProjectDescription ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        email,
        name,
        role,
        headline,
        institution: institution || (role === 'student' ? 'IIIT Delhi' : 'Technology Syndicate'),
        studentId,
        businessId,
        bio,
        skills: skillsString,
        linkedinUrl,
        githubUrl,
        githubUsername,
        portfolioUrl,
        resumeName,
        graduationYear,
        officeHours,
        topProjectUrl,
        topProjectDescription,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Member registered successfully in live database!',
      member,
    });
  } catch (error: any) {
    console.error('[API /api/members POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
