/**
 * Centralized, safe synchronization utility for registered members.
 * Syncs authenticated users directly into the Prisma database.
 */

export interface MemberSyncPayload {
  email: string;
  name?: string;
  role?: string;
  userType?: 'student' | 'professional';
  headline?: string;
  institution?: string;
  studentId?: string;
  businessId?: string;
  summary?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  resumeName?: string;
  graduationYear?: string;
  officeHours?: string;
  topProjectUrl?: string;
  topProjectDescription?: string;
  avatarUrl?: string;
}

export async function syncMemberToDatabase(profile: Partial<MemberSyncPayload> & { email: string; name?: string }) {
  if (!profile || !profile.email) return;
  try {
    const role =
      profile.userType === 'professional' || profile.role === 'Alumni' || profile.role === 'professional'
        ? 'professional'
        : 'student';

    const fallbackHeadline = role === 'professional' ? 'Verified Tech Professional' : 'Student Builder';
    const fallbackInstitution = role === 'professional' ? 'Enterprise Tech' : 'IIIT Delhi';

    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email.trim(),
        name: profile.name?.trim() || profile.email.split('@')[0],
        role,
        headline: profile.headline || fallbackHeadline,
        institution: profile.institution || fallbackInstitution,
        studentId: profile.studentId,
        businessId: profile.businessId,
        bio: profile.summary,
        skills: profile.skills || ['Full-Stack', 'TypeScript', 'Python'],
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        githubUsername: profile.githubUsername,
        portfolioUrl: profile.portfolioUrl,
        resumeName: profile.resumeName,
        graduationYear: profile.graduationYear,
        officeHours: profile.officeHours,
        topProjectUrl: profile.topProjectUrl,
        topProjectDescription: profile.topProjectDescription,
        avatarUrl:
          profile.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      }),
    });
  } catch (err) {
    console.warn('Sync member to database notice:', err);
  }
}
