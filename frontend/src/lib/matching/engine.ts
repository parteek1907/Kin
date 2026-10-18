import { prisma } from '../prisma';
import { scoreCandidate, ScorerCandidateInput, ScorerRequirementInput } from './scorer';
import { KinRequirement, Candidate } from '@prisma/client';

export interface TopMatchItem {
  candidate: Candidate;
  score: number;
  reasons: string[];
  rank: number;
}

export const FALLBACK_CANDIDATES: Array<any> = [
  {
    id: 'cand-001',
    name: 'Aarav Malhotra',
    headline: 'CS & AI @ IIIT Delhi (2025) | GenAI, PyTorch, RAG & LLM Agents',
    phoneE164: '+919871100001',
    email: 'aarav.m@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2025',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Machine Learning', 'AI', 'Llama', 'Docker']),
    experienceYears: 1.5,
    bio: 'Published research on agentic workflows and fine-tuning open weights. Built automated document synthesis engine with Llama & Vector DBs.',
    verifiedNode: true,
    trustScore: 96.0,
    activityScore: 98.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-002',
    name: 'Kavya Singhania',
    headline: 'M.Tech AI @ IIIT Delhi (2024) | Computer Vision & NLP Specialist',
    phoneE164: '+919871100002',
    email: 'kavya.m@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2024',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'PyTorch', 'OpenCV', 'NLP', 'Machine Learning', 'TensorFlow', 'FastAPI', 'AI']),
    experienceYears: 2.0,
    bio: 'ACL workshop co-author on multilingual Indian embeddings. Experienced with LoRA fine-tuning and diffusion pipelines.',
    verifiedNode: true,
    trustScore: 95.0,
    activityScore: 94.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-003',
    name: 'Siddharth Iyer',
    headline: 'Dual Degree AI @ IIT Madras (2025) | Deep Learning & Reinforcement Learning',
    phoneE164: '+919871100003',
    email: 'siddharth.i@iitm.ac.in',
    institution: 'IIT Madras',
    batch: '2025',
    location: 'Chennai',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'PyTorch', 'Reinforcement Learning', 'C++', 'CUDA', 'Data Science', 'AI']),
    experienceYears: 2.0,
    bio: 'Ex-research intern at Robert Bosch Center for Data Science. Specializes in low-latency inference on edge GPUs.',
    verifiedNode: true,
    trustScore: 94.0,
    activityScore: 91.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-004',
    name: 'Aditi Sharma',
    headline: 'Final Year CS @ IIIT Delhi (2025) | Modern Next.js, React & TypeScript',
    phoneE164: '+919871100004',
    email: 'aditi.s@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2025',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Tailwind', 'Node.js', 'PostgreSQL', 'GraphQL', 'JavaScript']),
    experienceYears: 2.0,
    bio: 'Created flagship university portal handling 10k daily visits. Winner of 3 national hackathons with clean component design systems.',
    verifiedNode: true,
    trustScore: 98.0,
    activityScore: 99.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-005',
    name: 'Rahul Varma',
    headline: 'B.Tech IT @ DTU (2025) | Frontend Engineer & Performance Enthusiast',
    phoneE164: '+919871100005',
    email: 'rahul.v@dtu.ac.in',
    institution: 'DTU',
    batch: '2025',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['React', 'TypeScript', 'Redux', 'Tailwind', 'CSS', 'JavaScript', 'HTML5']),
    experienceYears: 1.5,
    bio: 'Core frontend developer on DTU student platform. Obsessed with 60 FPS fluid micro-interactions and accessible UI.',
    verifiedNode: true,
    trustScore: 92.0,
    activityScore: 93.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-006',
    name: 'Tanvi Saxena',
    headline: 'Design & Tech Fellow @ IIITD (2024) | UI/UX & React Systems',
    phoneE164: '+919871100006',
    email: 'tanvi.s@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2024',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Figma', 'UI/UX', 'React', 'Tailwind', 'Design Systems', 'CSS', 'User Research']),
    experienceYears: 2.5,
    bio: 'Designed luxury fintech interfaces and campus apps. Specializes in luxury editorial design, typographic hierarchy, and intuitive UX.',
    verifiedNode: true,
    trustScore: 97.0,
    activityScore: 95.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-007',
    name: 'Vikram Joshi',
    headline: 'CS @ IIIT Delhi (2023) | Backend Architect | Go, Rust, Distributed Systems',
    phoneE164: '+919871100007',
    email: 'vikram.j@alumni.iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2023',
    location: 'Bengaluru',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Go', 'Rust', 'Kubernetes', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'Kafka']),
    experienceYears: 2.5,
    bio: 'Built real-time messaging pipeline handling 50k events/sec. Deep expertise in concurrency, database indexing, and cloud-native architecture.',
    verifiedNode: true,
    trustScore: 99.0,
    activityScore: 96.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-008',
    name: 'Harsh Vardhan',
    headline: 'CS @ IIT Delhi (2024) | Systems, Cloud & Kubernetes Infrastructure',
    phoneE164: '+919871100008',
    email: 'harsh.v@iitd.ac.in',
    institution: 'IIT Delhi',
    batch: '2024',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Go', 'Python', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'PostgreSQL', 'CI/CD']),
    experienceYears: 2.0,
    bio: 'Open-source contributor to CNCF ecosystem. Automated multi-region deployment infrastructure for campus incubators.',
    verifiedNode: true,
    trustScore: 95.0,
    activityScore: 92.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-009',
    name: 'Rohan Mehra',
    headline: 'Pre-final Year ECE @ IIIT Delhi (2026) | Embedded Rust, C++ & Kernel Hacking',
    phoneE164: '+919871100009',
    email: 'rohan.m@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2026',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Rust', 'C++', 'C', 'Linux', 'Embedded Systems', 'Python', 'RTOS']),
    experienceYears: 1.5,
    bio: 'Robotics club hardware lead. GSoC contributor to RTOS kernel drivers. Builds bulletproof firmware and high-frequency network code.',
    verifiedNode: true,
    trustScore: 93.0,
    activityScore: 94.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-010',
    name: 'Ananya Roy',
    headline: 'CS @ BITS Pilani (2025) | Cross-Platform Mobile Engineer (Flutter & React Native)',
    phoneE164: '+919871100010',
    email: 'ananya.r@bits-pilani.ac.in',
    institution: 'BITS Pilani',
    batch: '2025',
    location: 'Bengaluru',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Flutter', 'Dart', 'React Native', 'React', 'TypeScript', 'Firebase', 'Mobile App']),
    experienceYears: 2.0,
    bio: 'Shipped 3 apps on Google Play with 100k+ downloads. Smart India Hackathon finalist. Experienced with offline-first architecture.',
    verifiedNode: true,
    trustScore: 96.0,
    activityScore: 97.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-011',
    name: 'Karthik Raja',
    headline: 'CS @ IIT Madras (2024) | Native iOS & Flutter Engineer',
    phoneE164: '+919871100011',
    email: 'karthik.r@iitm.ac.in',
    institution: 'IIT Madras',
    batch: '2024',
    location: 'Chennai',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Flutter', 'Dart', 'Swift', 'iOS', 'Mobile App', 'Kotlin', 'Firebase']),
    experienceYears: 2.0,
    bio: 'Apple WWDC Swift Student Challenge recipient. Expert in fluid gesture physics, custom Flutter painters, and SwiftUI.',
    verifiedNode: true,
    trustScore: 95.0,
    activityScore: 90.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-012',
    name: 'Meera Nair',
    headline: 'Mathematics & Computing @ IIIT Delhi (2025) | Quantitative Analytics & ML',
    phoneE164: '+919871100012',
    email: 'meera.n@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2025',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'SQL', 'Pandas', 'Data Science', 'Machine Learning', 'PowerBI', 'Tableau']),
    experienceYears: 1.5,
    bio: 'Built algorithmic trading backtest engine and predictive churn model for D2C brands. Strong background in probability and stochastic calculus.',
    verifiedNode: true,
    trustScore: 94.0,
    activityScore: 91.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-013',
    name: 'Nikhil Kulkarni',
    headline: 'Data Science @ IIT Bombay (2024) | Big Data, Spark & Analytics Pipelines',
    phoneE164: '+919871100013',
    email: 'nikhil.k@iitb.ac.in',
    institution: 'IIT Bombay',
    batch: '2024',
    location: 'Mumbai',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'SQL', 'Spark', 'Data Engineering', 'PostgreSQL', 'Airflow', 'Data Science']),
    experienceYears: 2.0,
    bio: 'Architected analytics warehouse for IIT Bombay research lab. Skilled in ETL orchestration, dimensional modeling, and anomaly detection.',
    verifiedNode: true,
    trustScore: 97.0,
    activityScore: 95.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-014',
    name: 'Devansh Parekh',
    headline: 'CS @ NSUT (2024) | Security Researcher, Smart Contract Auditor & Cryptography',
    phoneE164: '+919871100014',
    email: 'devansh.p@nsut.ac.in',
    institution: 'NSUT',
    batch: '2024',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Cybersecurity', 'Solidity', 'Web3', 'Blockchain', 'Python', 'Smart Contracts', 'Penetration Testing']),
    experienceYears: 2.0,
    bio: 'Discovered high-severity vulnerabilities in DeFi protocols on Immunefi ($15k in bug bounties). Top 5 CTF player at Nullcon.',
    verifiedNode: true,
    trustScore: 96.0,
    activityScore: 93.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-015',
    name: 'Riya Sen',
    headline: 'CS & Social Sciences @ IIIT Delhi (2025) | Product Management & Growth',
    phoneE164: '+919871100015',
    email: 'riya.s@iiitd.ac.in',
    institution: 'IIIT Delhi',
    batch: '2025',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Product Management', 'Figma', 'User Research', 'SQL', 'Agile', 'Growth', 'Data Analysis']),
    experienceYears: 1.5,
    bio: 'Led user interviews across 500+ campus students for mental wellness product. Experienced in PRDs, A/B testing, and North Star metrics.',
    verifiedNode: true,
    trustScore: 93.0,
    activityScore: 96.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-016',
    name: 'Ishaan Bhatia',
    headline: 'Computer Science @ IIIT Hyderabad (2025) | Full-Stack & GenAI Integrations',
    phoneE164: '+919871100016',
    email: 'ishaan.b@iiit.ac.in',
    institution: 'IIIT Hyderabad',
    batch: '2025',
    location: 'Hyderabad',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['React', 'Node.js', 'Python', 'FastAPI', 'LangChain', 'TypeScript', 'PostgreSQL']),
    experienceYears: 2.0,
    bio: 'Built real-time conversational AI playground at IIIT-H Language Tech Research Center. Full-stack hackathon champion.',
    verifiedNode: true,
    trustScore: 97.0,
    activityScore: 98.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-017',
    name: 'Jaspreet Singh',
    headline: 'B.Tech IT @ DTU (2024) | Python Backend & Cloud Systems',
    phoneE164: '+919871100017',
    email: 'jaspreet.s@dtu.ac.in',
    institution: 'DTU',
    batch: '2024',
    location: 'Delhi',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Redis']),
    experienceYears: 2.0,
    bio: 'High-throughput API specialist. Built backend infrastructure for university placement portal handling 8,000 students.',
    verifiedNode: true,
    trustScore: 94.0,
    activityScore: 92.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-018',
    name: 'Pooja Patel',
    headline: 'CS @ IIT Gandhinagar (2025) | Frontend & Interactive Web Apps',
    phoneE164: '+919871100018',
    email: 'pooja.p@iitgn.ac.in',
    institution: 'IIT Gandhinagar',
    batch: '2025',
    location: 'Ahmedabad',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['React', 'TypeScript', 'Next.js', 'Tailwind', 'Three.js', 'Figma']),
    experienceYears: 1.5,
    bio: 'Specialist in 3D interactive web experiences with Three.js and Tailwind. Creative coder and design engineer.',
    verifiedNode: true,
    trustScore: 93.0,
    activityScore: 95.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-019',
    name: 'Manish Reddy',
    headline: 'CS @ BITS Pilani Hyderabad (2024) | DevOps & SRE Specialist',
    phoneE164: '+919871100019',
    email: 'manish.r@hyderabad.bits-pilani.ac.in',
    institution: 'BITS Pilani',
    batch: '2024',
    location: 'Hyderabad',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'Go', 'AWS', 'Linux', 'Prometheus']),
    experienceYears: 2.0,
    bio: 'Managed campus server cluster for high-performance computing labs. AWS Certified Solutions Architect.',
    verifiedNode: true,
    trustScore: 95.0,
    activityScore: 91.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cand-020',
    name: 'Sneha Deshmukh',
    headline: 'CS @ IIT Bombay (2025) | NLP, Speech & Language Technologies',
    phoneE164: '+919871100020',
    email: 'sneha.d@iitb.ac.in',
    institution: 'IIT Bombay',
    batch: '2025',
    location: 'Pune',
    isRemote: true,
    discoverable: true,
    available: true,
    skills: JSON.stringify(['Python', 'PyTorch', 'NLP', 'Whisper', 'HuggingFace', 'FastAPI']),
    experienceYears: 1.8,
    bio: 'Worked on Indic language speech synthesis and multilingual acoustic modeling. Passionate about bridging language barriers in tech.',
    verifiedNode: true,
    trustScore: 96.0,
    activityScore: 97.0,
    lastActiveAt: new Date(),
    consentGivenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function findTopCandidates(
  requirement: KinRequirement,
  limit = 5,
  offset = 0
): Promise<TopMatchItem[]> {
  // 1. Fetch Candidates from Database, with automatic static in-memory fallback
  let candidateRecords: any[] = [];
  try {
    candidateRecords = await prisma.candidate.findMany({
      where: {
        discoverable: true,
        available: true,
      },
    });
  } catch (err) {
    console.warn('[Matching Engine] DB candidate fetch error, falling back to static pool:', err);
  }

  if (!candidateRecords || candidateRecords.length === 0) {
    candidateRecords = FALLBACK_CANDIDATES;
  }

  const parsedMustHaves: string[] = safeJsonParse(requirement.mustHaveSkills, []);
  const parsedNiceToHaves: string[] = safeJsonParse(requirement.niceToHaveSkills, []);

  // Fetch alumnus details if present for trust proximity
  let alumnus = null;
  if (requirement.alumnusId) {
    try {
      alumnus = await prisma.alumni.findUnique({ where: { id: requirement.alumnusId } });
    } catch {
      // Non-blocking
    }
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

  // Apply location compatibility filter (with fallback to remote candidates if none match)
  let locationCompatible = candidateRecords.filter((cand: any) => {
    if (isReqRemote) return true;
    if (cand.isRemote) return true;
    if (cand.location.toLowerCase().includes(requirement.locationOrRemote.toLowerCase())) {
      return true;
    }
    return false;
  });

  if (locationCompatible.length === 0) {
    locationCompatible = candidateRecords;
  }

  // 2. Score candidates
  const scored = locationCompatible.map((cand: any) => {
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
  scored.sort((a: any, b: any) => b.score - a.score);

  const paginated = scored.slice(offset, offset + limit);

  // 3. Save matches to database if available, always return the top candidates
  const finalMatches: TopMatchItem[] = [];
  let rank = offset + 1;

  for (const item of paginated) {
    try {
      if (
        requirement.id &&
        !requirement.id.startsWith('test-') &&
        !requirement.id.startsWith('req_') &&
        !item.candidate.id.startsWith('cand-')
      ) {
        await prisma.requirementMatch.upsert({
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
      }
    } catch {
      // Non-blocking: matches delivery must not fail even if match table writes fail
    }

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
