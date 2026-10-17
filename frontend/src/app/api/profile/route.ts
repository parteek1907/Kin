import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function cleanUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function extractGithubUsername(urlOrUsername?: string): string | undefined {
  if (!urlOrUsername) return undefined;
  const trimmed = urlOrUsername.trim();
  if (!trimmed) return undefined;
  // If it's a full URL e.g. https://github.com/username
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  // Otherwise clean off leading @ if user typed @username
  return trimmed.replace(/^@/, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      role,
      headline,
      institution,
      userType = 'student',
      studentId,
      businessId,
      linkedinUrl,
      githubUrl,
      githubUsername,
      portfolioUrl,
      resumeName,
      resumeUrl,
      skills = [],
      bio,
      interests = [],
      graduationYear,
      officeHours,
      topProjectUrl,
      topProjectDescription,
    } = body;

    const normalizedLinkedin = cleanUrl(linkedinUrl);
    const normalizedGithub = cleanUrl(githubUrl);
    const normalizedPortfolio = cleanUrl(portfolioUrl);
    const normalizedProjectUrl = cleanUrl(topProjectUrl);
    const derivedGithubUsername = githubUsername || extractGithubUsername(normalizedGithub || githubUrl);

    const completedProfile = {
      name: name?.trim() || 'Verified Builder',
      email: email?.trim() || 'builder@kin.network',
      role: role?.trim() || (userType === 'student' ? 'Student Builder' : 'Alumni / Professional'),
      headline: headline?.trim() || role?.trim() || (userType === 'student' ? 'Computer Science & Engineering' : 'Senior Systems Architect'),
      institution: institution?.trim() || (userType === 'student' ? 'IIIT Delhi' : 'Technology Syndicate'),
      userType,
      studentId: studentId?.trim(),
      businessId: businessId?.trim(),
      verificationStatus: userType === 'student' ? 'verified_student' : 'verified_professional',
      linkedinUrl: normalizedLinkedin,
      githubUrl: normalizedGithub,
      githubUsername: derivedGithubUsername,
      portfolioUrl: normalizedPortfolio,
      resumeName: resumeName?.trim(),
      resumeUrl: resumeUrl?.trim(),
      skills: Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      bio: bio?.trim(),
      summary: bio?.trim(),
      interests: Array.isArray(interests) ? interests : [],
      graduationYear: graduationYear?.trim(),
      officeHours: officeHours?.trim(),
      topProjectUrl: normalizedProjectUrl,
      topProjectDescription: topProjectDescription?.trim(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Persist directly to Live Database (Prisma Member model)
    try {
      await prisma.member.upsert({
        where: { email: completedProfile.email },
        update: {
          name: completedProfile.name,
          role: userType === 'student' ? 'student' : 'professional',
          headline: completedProfile.headline,
          institution: completedProfile.institution,
          studentId: completedProfile.studentId ?? undefined,
          businessId: completedProfile.businessId ?? undefined,
          verificationStatus: completedProfile.verificationStatus,
          linkedinUrl: completedProfile.linkedinUrl ?? undefined,
          githubUrl: completedProfile.githubUrl ?? undefined,
          githubUsername: completedProfile.githubUsername ?? undefined,
          portfolioUrl: completedProfile.portfolioUrl ?? undefined,
          resumeName: completedProfile.resumeName ?? undefined,
          skills: JSON.stringify(completedProfile.skills),
          bio: completedProfile.bio ?? undefined,
          graduationYear: completedProfile.graduationYear ?? undefined,
          officeHours: completedProfile.officeHours ?? undefined,
          topProjectUrl: completedProfile.topProjectUrl ?? undefined,
          topProjectDescription: completedProfile.topProjectDescription ?? undefined,
          updatedAt: new Date(),
        },
        create: {
          email: completedProfile.email,
          name: completedProfile.name,
          role: userType === 'student' ? 'student' : 'professional',
          headline: completedProfile.headline,
          institution: completedProfile.institution,
          studentId: completedProfile.studentId ?? undefined,
          businessId: completedProfile.businessId ?? undefined,
          verificationStatus: completedProfile.verificationStatus,
          linkedinUrl: completedProfile.linkedinUrl ?? undefined,
          githubUrl: completedProfile.githubUrl ?? undefined,
          githubUsername: completedProfile.githubUsername ?? undefined,
          portfolioUrl: completedProfile.portfolioUrl ?? undefined,
          resumeName: completedProfile.resumeName ?? undefined,
          skills: JSON.stringify(completedProfile.skills),
          bio: completedProfile.bio ?? undefined,
          graduationYear: completedProfile.graduationYear ?? undefined,
          officeHours: completedProfile.officeHours ?? undefined,
          topProjectUrl: completedProfile.topProjectUrl ?? undefined,
          topProjectDescription: completedProfile.topProjectDescription ?? undefined,
        },
      });
    } catch (dbErr) {
      console.warn('[Prisma Member Upsert Warning]', dbErr);
    }

    // Forward sync to backend FastAPI database if running
    try {
      const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
      await fetch(`${backendUrl}/api/v1/auth/firebase-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: body.firebaseUid || `usr_${Date.now()}`,
          email: completedProfile.email,
          full_name: completedProfile.name,
          user_type: userType,
          student_id: completedProfile.studentId || null,
          business_id: completedProfile.businessId || null,
          institution_or_company: completedProfile.institution,
          department_or_title: completedProfile.headline,
        }),
      }).catch(() => {});
    } catch {
      // Non-fatal if backend is busy or offline
    }

    return NextResponse.json({
      success: true,
      message: 'Profile completed & persisted successfully!',
      profile: completedProfile,
    });
  } catch (error: any) {
    console.error('[API /api/profile Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  return NextResponse.json({
    success: true,
    email,
    message: 'Profile endpoint operational.',
  });
}
