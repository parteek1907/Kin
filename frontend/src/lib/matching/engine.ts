import { prisma } from '../prisma';
import { scoreCandidate, ScorerCandidateInput, ScorerRequirementInput } from './scorer';
import { KinRequirement, Candidate, RequirementMatch } from '@prisma/client';

export interface TopMatchItem {
  candidate: Candidate;
  score: number;
  reasons: string[];
  rank: number;
}

export async function findTopCandidates(
  requirement: KinRequirement,
  limit = 5,
  offset = 0
): Promise<TopMatchItem[]> {
  // Ensure we have candidates in database (seed mock candidates if empty)
  await ensureInitialCandidates();

  // 1. Hard Filters:
  // - discoverable = true (opted-in)
  // - available = true
  // - location compatibility
  const candidateRecords = await prisma.candidate.findMany({
    where: {
      discoverable: true,
      available: true,
    },
  });

  const parsedMustHaves: string[] = safeJsonParse(requirement.mustHaveSkills, []);
  const parsedNiceToHaves: string[] = safeJsonParse(requirement.niceToHaveSkills, []);

  // Fetch alumnus details if present for trust proximity
  let alumnus = null;
  if (requirement.alumnusId) {
    alumnus = await prisma.alumni.findUnique({ where: { id: requirement.alumnusId } });
  }

  const reqInput: ScorerRequirementInput = {
    title: requirement.title,
    type: requirement.type,
    mustHaveSkills: parsedMustHaves,
    niceToHaveSkills: parsedNiceToHaves,
    experienceLevel: requirement.experienceLevel,
    locationOrRemote: requirement.locationOrRemote,
    institution: alumnus?.institution,
    batch: alumnus?.batch,
  };

  const isReqRemote =
    requirement.locationOrRemote.toLowerCase().includes('remote') ||
    requirement.locationOrRemote === 'any';

  // Apply location compatibility hard filter
  const locationCompatible = candidateRecords.filter((cand) => {
    if (isReqRemote) return true;
    if (cand.isRemote) return true;
    if (cand.location.toLowerCase().includes(requirement.locationOrRemote.toLowerCase())) {
      return true;
    }
    return false;
  });

  // 2. Score candidates
  const scored = locationCompatible.map((cand) => {
    const candSkills: string[] = safeJsonParse(cand.skills, []);
    const candInput: ScorerCandidateInput = {
      name: cand.name,
      headline: cand.headline,
      skills: candSkills,
      institution: cand.institution,
      batch: cand.batch,
      location: cand.location,
      isRemote: cand.isRemote,
      experienceYears: cand.experienceYears,
      verifiedNode: cand.verifiedNode,
      trustScore: cand.trustScore,
      activityScore: cand.activityScore,
      lastActiveAt: cand.lastActiveAt,
      bio: cand.bio,
    };

    const result = scoreCandidate(reqInput, candInput);
    return {
      candidate: cand,
      score: result.score,
      reasons: result.reasons,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const paginated = scored.slice(offset, offset + limit);

  // 3. Save matches to database
  const finalMatches: TopMatchItem[] = [];
  let rank = offset + 1;

  for (const item of paginated) {
    const existing = await prisma.requirementMatch.upsert({
      where: {
        requirementId_candidateId: {
          requirementId: requirement.id,
          candidateId: item.candidate.id,
        },
      },
      update: {
        score: item.score,
        reasons: JSON.stringify(item.reasons),
        rank,
      },
      create: {
        requirementId: requirement.id,
        candidateId: item.candidate.id,
        score: item.score,
        reasons: JSON.stringify(item.reasons),
        rank,
        status: 'suggested',
      },
    });

    finalMatches.push({
      candidate: item.candidate,
      score: item.score,
      reasons: item.reasons,
      rank,
    });
    rank++;
  }

  return finalMatches;
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Ensures high-quality candidate data exists for IIITD and peer institutions.
 */
export async function ensureInitialCandidates(): Promise<void> {
  const count = await prisma.candidate.count();
  if (count >= 5) return;

  const mockProfiles = [
    {
      name: 'Aditi Sharma',
      headline: 'Final Year CS @ IIIT Delhi | Full-Stack & Systems',
      phoneE164: '+919876543201',
      email: 'aditi.s@iiitd.ac.in',
      institution: 'IIIT Delhi',
      batch: '2024',
      location: 'Delhi',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Tailwind']),
      experienceYears: 1.5,
      bio: 'Built distributed key-value store in Rust. 2 production React internships. Open to early-stage ventures.',
      verifiedNode: true,
      trustScore: 94.0,
      activityScore: 98.0,
    },
    {
      name: 'Kavya Singhania',
      headline: 'M.Tech AI @ IIIT Delhi | GenAI, PyTorch, RAG Pipelines',
      phoneE164: '+919876543202',
      email: 'kavya.m@iiitd.ac.in',
      institution: 'IIIT Delhi',
      batch: '2024',
      location: 'Delhi',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['Python', 'PyTorch', 'FastAPI', 'Machine Learning', 'AI', 'Docker']),
      experienceYears: 2.0,
      bio: 'Published ACL workshop paper on multilingual embeddings. Hands-on experience fine-tuning LLMs with LoRA.',
      verifiedNode: true,
      trustScore: 92.0,
      activityScore: 95.0,
    },
    {
      name: 'Rohan Mehra',
      headline: 'Pre-final Year ECE @ IIIT Delhi | Embedded Systems & Rust',
      phoneE164: '+919876543203',
      email: 'rohan.m@iiitd.ac.in',
      institution: 'IIIT Delhi',
      batch: '2025',
      location: 'Delhi',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['Rust', 'C++', 'Python', 'Docker', 'Linux']),
      experienceYears: 1.0,
      bio: 'Robotics club lead. GSoC contributor to open-source embedded kernels.',
      verifiedNode: true,
      trustScore: 89.0,
      activityScore: 90.0,
    },
    {
      name: 'Tanvi Saxena',
      headline: 'Design & Tech Fellow @ IIITD | UI/UX & React Frontend',
      phoneE164: '+919876543204',
      email: 'tanvi.s@iiitd.ac.in',
      institution: 'IIIT Delhi',
      batch: '2023',
      location: 'Delhi',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['Figma', 'UI/UX', 'React', 'CSS', 'Tailwind', 'Design Systems']),
      experienceYears: 2.0,
      bio: 'Designed flagship campus apps used by 4,000+ students. Passionate about minimalism and micro-interactions.',
      verifiedNode: true,
      trustScore: 91.0,
      activityScore: 88.0,
    },
    {
      name: 'Vikram Joshi',
      headline: 'Full-Stack Software Engineer @ IIIT Delhi (2022) | Go & Cloud',
      phoneE164: '+919876543205',
      email: 'vikram.j@alumni.iiitd.ac.in',
      institution: 'IIIT Delhi',
      batch: '2022',
      location: 'Bengaluru',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['Go', 'React', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL']),
      experienceYears: 3.0,
      bio: 'Ex-Zomato backend engineer. Building scalable event-driven microservices.',
      verifiedNode: true,
      trustScore: 96.0,
      activityScore: 92.0,
    },
    {
      name: 'Ananya Roy',
      headline: 'Computer Science @ BITS Pilani | React & Mobile Dev',
      phoneE164: '+919876543206',
      email: 'ananya.r@bits-pilani.ac.in',
      institution: 'BITS Pilani',
      batch: '2024',
      location: 'Delhi',
      isRemote: true,
      discoverable: true,
      available: true,
      skills: JSON.stringify(['React', 'TypeScript', 'React Native', 'Node.js', 'PostgreSQL']),
      experienceYears: 1.5,
      bio: 'Hackathon finalist at Smart India Hackathon. Cross-platform mobile specialist.',
      verifiedNode: true,
      trustScore: 88.0,
      activityScore: 85.0,
    },
  ];

  for (const p of mockProfiles) {
    await prisma.candidate.upsert({
      where: { phoneE164: p.phoneE164 },
      update: {},
      create: p,
    });
  }
}
