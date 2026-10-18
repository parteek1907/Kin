import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    // Dynamically synchronize any real users registered in backend database
    try {
      const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const backendRes = await fetch(`${backendBase}/api/v1/auth/registered-users`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(1500),
      }).catch(() => null);

      if (backendRes && backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && Array.isArray(data.users)) {
          for (const u of data.users) {
            if (u.email) {
              const skillsStr = Array.isArray(u.skills) ? JSON.stringify(u.skills) : '[]';
              await prisma.member.upsert({
                where: { email: u.email },
                update: {
                  name: u.name,
                  role: u.role || 'student',
                  headline: u.headline ?? undefined,
                  institution: u.institution || 'IIIT Delhi',
                  studentId: u.student_id ?? undefined,
                  businessId: u.business_id ?? undefined,
                  verificationStatus: u.verification_status || 'verified',
                  skills: skillsStr,
                  bio: u.bio ?? undefined,
                },
                create: {
                  email: u.email,
                  name: u.name,
                  role: u.role || 'student',
                  headline: u.headline || (u.role === 'student' ? 'Student Builder' : 'Tech Leader'),
                  institution: u.institution || 'IIIT Delhi',
                  studentId: u.student_id,
                  businessId: u.business_id,
                  verificationStatus: u.verification_status || 'verified',
                  skills: skillsStr,
                  bio: u.bio,
                  avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.email)}&backgroundColor=e25c38,1e293b&textColor=ffffff`,
                },
              });
            }
          }
        }
      }
    } catch (err) {
      // Non-fatal if backend is busy or restarting
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'student' | 'professional' | 'alumni' | 'all'
    const search = searchParams.get('search')?.trim().toLowerCase();
    const currentUserEmail = searchParams.get('currentUserEmail');

    // Build where clause
    const where: any = {
      email: {
        notIn: [
          'builder@kin.network',
          'rohan.malhotra@alumni.iiitd.ac.in',
          'vikram.sen@alumni.iiitd.ac.in',
          'arjun.kapoor@alumni.iiitd.ac.in',
        ],
      },
    };

    if (role && role !== 'all') {
      if (role === 'professional' || role === 'alumni') {
        where.role = { in: ['professional', 'alumni'] };
      } else {
        where.role = role;
      }
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { headline: { contains: search } },
            { institution: { contains: search } },
            { skills: { contains: search } },
            { bio: { contains: search } },
          ],
        },
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
        where: { email: currentUserEmail.trim().toLowerCase() },
        select: { id: true },
      });
      if (currentMember) {
        currentMemberId = currentMember.id;
      }
    }

    // Format member records and determine connection state
    const formatted = members.map((m: any) => {
      let connectionStatus: 'none' | 'pending' | 'connected' | 'self' = 'none';
      let connectionId: string | null = null;

      if (currentMemberId) {
        if (m.id === currentMemberId) {
          connectionStatus = 'self';
        } else {
          // Check sent
          const sent = m.receivedConnections.find((c: any) => c.senderId === currentMemberId);
          if (sent) {
            connectionStatus = sent.status === 'accepted' ? 'connected' : 'pending';
            connectionId = sent.id;
          } else {
            // Check received
            const received = m.sentConnections.find((c: any) => c.receiverId === currentMemberId);
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

      const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || m.email)}&backgroundColor=e25c38,1e293b&textColor=ffffff`;

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
        avatarUrl: m.name?.toLowerCase().includes('aditya sharma')
          ? '/images/aditya_sharma.jpg'
          : (m.avatarUrl || fallbackAvatar),
        connectionStatus,
        connectionId,
        createdAt: m.createdAt,
      };
    });

    // Guarantee zero duplicate entries in members directory (keyed by email, with seed protection)
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();
    const deduplicatedMembers = formatted.filter((m: any) => {
      const email = m.email?.toLowerCase().trim();
      const name = m.name?.toLowerCase().trim();
      if (email) {
        if (seenEmails.has(email)) return false;
        seenEmails.add(email);
      }
      const isPrioritySeed = ['aditya sharma', 'parteek garg', 'darsh ohri', 'nipun dhiman', 'aditya tanwar'].includes(name);
      if (isPrioritySeed && seenNames.has(name)) {
        return false;
      }
      if (name) seenNames.add(name);
      return true;
    });

    return NextResponse.json({
      success: true,
      total: deduplicatedMembers.length,
      members: deduplicatedMembers,
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
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}&backgroundColor=e25c38,1e293b&textColor=ffffff`,
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
