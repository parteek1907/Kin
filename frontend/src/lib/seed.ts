import { prisma } from './prisma';

export async function ensureDatabaseSeeded() {
  try {
    const memberCount = await prisma.member.count();
    if (memberCount >= 5) {
      return; // Already seeded
    }

    console.log('[Seed] Seeding live KIN network members and social media feed...');

    // 1. Create Verified Students
    const aditya = await prisma.member.upsert({
      where: { email: 'aditya@iiitd.ac.in' },
      update: {},
      create: {
        email: 'aditya@iiitd.ac.in',
        name: 'Aditya Sharma',
        role: 'student',
        headline: 'Full-Stack & AI Systems Builder',
        institution: 'IIIT Delhi',
        studentId: '2022CSB1042',
        verificationStatus: 'verified',
        graduationYear: '2026',
        skills: JSON.stringify(['React', 'Next.js', 'Python', 'FastAPI', 'PyTorch', 'TypeScript', 'Docker']),
        linkedinUrl: 'https://linkedin.com/in/adityasharma',
        githubUrl: 'https://github.com/adityaa6060',
        githubUsername: 'adityaa6060',
        portfolioUrl: 'https://adityasharma.dev',
        topProjectUrl: 'https://github.com/adityaa6060/distributed-consensus-engine',
        topProjectDescription: 'High-throughput indexing pipeline processing 10k events/sec using Go & Redis.',
        bio: 'Undergraduate CS builder building agentic intelligence workflows, high-concurrency backends, and full-stack interfaces.',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      },
    });

    const kavya = await prisma.member.upsert({
      where: { email: 'kavya.verma@iiitd.ac.in' },
      update: {},
      create: {
        email: 'kavya.verma@iiitd.ac.in',
        name: 'Kavya Verma',
        role: 'student',
        headline: 'AI/ML Systems Researcher',
        institution: 'IIIT Delhi',
        studentId: '2021CSAI098',
        verificationStatus: 'verified',
        graduationYear: '2025',
        skills: JSON.stringify(['PyTorch', 'HuggingFace', 'CUDA', 'C++', 'Python', 'Model Quantization']),
        linkedinUrl: 'https://linkedin.com/in/kavyaverma',
        githubUrl: 'https://github.com/kavyaverma',
        githubUsername: 'kavyaverma',
        portfolioUrl: 'https://kavyaverma.ai',
        topProjectUrl: 'https://github.com/kavyaverma/sub-token-quantizer',
        topProjectDescription: '4-bit integer quantization kernel reducing memory by 68% for Llama 3 models.',
        bio: 'Researching low-precision arithmetic kernels for transformer latency reduction on consumer GPUs.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      },
    });

    const rohan = await prisma.member.upsert({
      where: { email: 'rohan.mehta@iiitd.ac.in' },
      update: {},
      create: {
        email: 'rohan.mehta@iiitd.ac.in',
        name: 'Rohan Mehta',
        role: 'student',
        headline: 'Distributed Systems & Cloud Engineer',
        institution: 'IIIT Delhi',
        studentId: '2022CSB1120',
        verificationStatus: 'verified',
        graduationYear: '2026',
        skills: JSON.stringify(['Go', 'Kubernetes', 'gRPC', 'Docker', 'PostgreSQL', 'Kafka']),
        linkedinUrl: 'https://linkedin.com/in/rohanmehta',
        githubUrl: 'https://github.com/rohanmehta',
        githubUsername: 'rohanmehta',
        portfolioUrl: 'https://rohanmehta.cloud',
        topProjectUrl: 'https://github.com/rohanmehta/raft-kv-store',
        topProjectDescription: 'Fault-tolerant distributed key-value store using Raft consensus protocol in pure Go.',
        bio: 'Obsessed with high-availability datastores, Raft consensus, and zero-downtime deployments.',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      },
    });

    // 2. Create Verified Alumni / Working Professionals
    const parth = await prisma.member.upsert({
      where: { email: 'parth.arora@deepmind.com' },
      update: {},
      create: {
        email: 'parth.arora@deepmind.com',
        name: 'Parth Arora',
        role: 'professional',
        headline: 'Staff Infrastructure Architect',
        institution: 'Google DeepMind (IIITD Class of 2019)',
        businessId: 'EMP_GOOG_8841',
        verificationStatus: 'verified',
        graduationYear: '2019',
        skills: JSON.stringify(['Distributed Systems', 'C++', 'Python', 'TPU Clusters', 'System Architecture', 'Mentorship']),
        linkedinUrl: 'https://linkedin.com/in/partharora',
        githubUrl: 'https://github.com/partharora',
        githubUsername: 'partharora',
        portfolioUrl: 'https://partharora.systems',
        officeHours: 'Saturday 10:00 AM - 12:00 PM IST',
        bio: 'Class of 2019 alumnus. Building distributed cluster management at DeepMind. Actively mentoring campus builders on production resilience.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      },
    });

    const sneha = await prisma.member.upsert({
      where: { email: 'sneha.kapoor@anthropic.com' },
      update: {},
      create: {
        email: 'sneha.kapoor@anthropic.com',
        name: 'Sneha Kapoor',
        role: 'professional',
        headline: 'Member of Technical Staff • Alignment',
        institution: 'Anthropic (IIITD Class of 2020)',
        businessId: 'EMP_ANTH_2209',
        verificationStatus: 'verified',
        graduationYear: '2020',
        skills: JSON.stringify(['AI Safety', 'Mechanistic Interpretability', 'Python', 'PyTorch', 'Distributed Training']),
        linkedinUrl: 'https://linkedin.com/in/snehakapoor',
        githubUrl: 'https://github.com/snehakapoor',
        githubUsername: 'snehakapoor',
        portfolioUrl: 'https://snehakapoor.ai',
        officeHours: 'Sunday 4:00 PM - 6:00 PM IST',
        bio: 'Class of 2020 alumna. Researching transformer circuit interpretability and steering methods for safety at Anthropic.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      },
    });

    const vikram = await prisma.member.upsert({
      where: { email: 'vikram.singh@uber.com' },
      update: {},
      create: {
        email: 'vikram.singh@uber.com',
        name: 'Vikram Singh',
        role: 'professional',
        headline: 'Senior Engineering Manager',
        institution: 'Uber (IIITD Class of 2018)',
        businessId: 'EMP_UBER_6104',
        verificationStatus: 'verified',
        graduationYear: '2018',
        skills: JSON.stringify(['High Concurrency', 'Go', 'Apache Kafka', 'FinTech', 'Technical Hiring']),
        linkedinUrl: 'https://linkedin.com/in/vikramsingh',
        githubUrl: 'https://github.com/vikramsingh',
        githubUsername: 'vikramsingh',
        portfolioUrl: 'https://vikramsingh.dev',
        officeHours: 'Alternate Fridays 5:00 PM - 7:00 PM IST',
        bio: 'Hiring campus talent for Uber platform infrastructure. Sponsoring student skill bounties and conducting mock systems design interviews.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      },
    });

    const ananya = await prisma.member.upsert({
      where: { email: 'ananya.deshmukh@stripe.com' },
      update: {},
      create: {
        email: 'ananya.deshmukh@stripe.com',
        name: 'Ananya Deshmukh',
        role: 'professional',
        headline: 'Principal Core Payments Architect',
        institution: 'Stripe (IIITD Class of 2017)',
        businessId: 'EMP_STRIPE_0192',
        verificationStatus: 'verified',
        graduationYear: '2017',
        skills: JSON.stringify(['Payment Rail Resiliency', 'Idempotency', 'Ruby', 'Java', 'Distributed Databases']),
        linkedinUrl: 'https://linkedin.com/in/ananyadeshmukh',
        githubUrl: 'https://github.com/ananyadeshmukh',
        githubUsername: 'ananyadeshmukh',
        portfolioUrl: 'https://ananyadeshmukh.io',
        officeHours: 'Bi-weekly Tuesdays via Zoom',
        bio: 'Class of 2017 alumna. Architecting global settlement engines. Advocating for campus female builders in distributed engineering.',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      },
    });

    // 3. Create Seed Social Feed Posts (Public & Ghost Mode)
    const post1 = await prisma.post.create({
      data: {
        memberId: parth.id,
        authorName: 'Parth Arora',
        authorRole: 'Staff Infrastructure Architect • Google DeepMind',
        authorInstitution: 'Google DeepMind (IIITD Class of 2019)',
        authorAvatar: parth.avatarUrl,
        content: 'To every campus student preparing for backend systems interviews: stop memorizing LeetCode hard DP problems in isolation. Build an actual end-to-end multi-node Raft consensus cluster or a distributed WAL with zero dataloss guarantees. That single repository gets you an offer over 99% of candidates.',
        tags: JSON.stringify(['#SystemsArchitecture', '#DistributedSystems', '#CareerAdvice']),
        likesCount: 42,
        isGhost: false,
      },
    });

    await prisma.comment.create({
      data: {
        postId: post1.id,
        memberId: aditya.id,
        authorName: 'Aditya Sharma',
        authorRole: 'Student • IIIT Delhi 2026',
        content: 'Spot on Parth bhaiya! Built my distributed consensus engine in Go with Redis fallback last week. The partition test cases were the biggest learning curve.',
      },
    });

    const post2 = await prisma.post.create({
      data: {
        memberId: sneha.id,
        authorName: 'Sneha Kapoor',
        authorRole: 'Member of Technical Staff • Anthropic',
        authorInstitution: 'Anthropic (IIITD Class of 2020)',
        authorAvatar: sneha.avatarUrl,
        content: 'Opening 2 student research sponsorship grants for IIITD undergraduates interested in Mechanistic Interpretability on sparse autoencoders. If your GitHub shows working PyTorch transformer implementations, drop me a connection request directly here on KIN!',
        tags: JSON.stringify(['#Anthropic', '#ResearchGrants', '#AIInterpretability']),
        likesCount: 58,
        isGhost: false,
      },
    });

    const post3 = await prisma.post.create({
      data: {
        memberId: vikram.id,
        authorName: 'Vikram Singh',
        authorRole: 'Senior Engineering Manager • Uber',
        authorInstitution: 'Uber (IIITD Class of 2018)',
        authorAvatar: vikram.avatarUrl,
        content: 'We just reviewed 3 candidate submissions on the KIN Challenge Board for the "Zero-Downtime Cache Invalidation" problem statement. Absolutely blown away by the code cleanliness and benchmark test coverage. Shortlisting 2 builders for direct final-round engineering interviews!',
        tags: JSON.stringify(['#ProofOfWork', '#Hiring', '#UberEngineering']),
        likesCount: 37,
        isGhost: false,
      },
    });

    // Ghost Posts
    await prisma.post.create({
      data: {
        authorName: 'Ghost-Architect-402',
        authorRole: 'Staff Architect • Tier 1 Firm',
        authorInstitution: 'Verified Alumni (Encrypted Identity)',
        content: 'Real compensation reality check for campus grads: Base bands capped at ₹45L for SDE-2 in Bangalore. The ₹90L CTCs advertised in news headlines include 4-year unvested RSUs priced at 2021 bubble valuations. Focus on liquid base equity, tech stack ownership, and team mentorship over paper unicorn valuations.',
        tags: JSON.stringify(['#GhostInsight', '#SalaryBands', '#RealCompensation']),
        likesCount: 89,
        isGhost: true,
        ghostPersona: 'Ghost-Architect-402',
      },
    });

    await prisma.post.create({
      data: {
        authorName: 'Ghost-Cadet-108',
        authorRole: 'Student • Tier 3 College',
        authorInstitution: 'Verified Student (Anonymous)',
        content: 'Is it true that top product firms filter out non-target colleges even if your GitHub has 400+ commits on production-grade Rust systems? Need honest answers from seniors.',
        tags: JSON.stringify(['#GhostInsight', '#CampusReality', '#OpenSource']),
        likesCount: 34,
        isGhost: true,
        ghostPersona: 'Ghost-Cadet-108',
      },
    });

    // 4. Create Initial Connections
    await prisma.connection.upsert({
      where: {
        senderId_receiverId: {
          senderId: aditya.id,
          receiverId: parth.id,
        },
      },
      update: {},
      create: {
        senderId: aditya.id,
        receiverId: parth.id,
        status: 'accepted',
        note: 'Loved your distributed systems write-up on LinkedIn! Would love to connect.',
      },
    });

    await prisma.connection.upsert({
      where: {
        senderId_receiverId: {
          senderId: kavya.id,
          receiverId: sneha.id,
        },
      },
      update: {},
      create: {
        senderId: kavya.id,
        receiverId: sneha.id,
        status: 'accepted',
        note: 'Reading your sparse autoencoders paper. Excited to connect!',
      },
    });

    await prisma.connection.upsert({
      where: {
        senderId_receiverId: {
          senderId: rohan.id,
          receiverId: vikram.id,
        },
      },
      update: {},
      create: {
        senderId: rohan.id,
        receiverId: vikram.id,
        status: 'pending',
        note: 'Hi Vikram sir! Submitted a solution for the caching bounty.',
      },
    });

    console.log('[Seed] Database successfully seeded with verified members, live social posts, and connections!');
  } catch (error) {
    console.error('[Seed] Database seeding warning:', error);
  }
}
