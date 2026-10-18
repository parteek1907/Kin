import { prisma } from './prisma';

/**
 * Ensures required students and alumni are always properly registered in the database,
 * corrupted entries fixed, and default post author avatars have correct male portraits.
 */
export async function ensureDatabaseSeeded() {
  try {
    // 1. Fix corrupted student records
    await prisma.member.updateMany({
      where: {
        OR: [
          { email: 'adityatanwar13827@gmail.com' },
          { name: '%PDF-1.7' },
        ],
      },
      data: {
        name: 'Aditya Tanwar',
        role: 'student',
        headline: 'Full-Stack & Systems Builder',
        institution: 'IIIT Delhi',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      },
    });

    await prisma.member.updateMany({
      where: {
        OR: [
          { email: 'raycray6291@gmail.com' },
          { name: 'no clue' },
        ],
      },
      data: {
        name: 'Parteek Garg',
        role: 'student',
        headline: 'AI Systems & Full-Stack Engineer',
        institution: 'IIIT Delhi',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      },
    });

    await prisma.member.updateMany({
      where: {
        OR: [
          { email: 'nipun2108dhiman@gmail.com' },
          { name: 'Nipun2108dhiman' },
        ],
      },
      data: {
        name: 'Nipun Dhiman',
        role: 'student',
        headline: 'Computer Science & Cloud Systems',
        institution: 'IIIT Delhi',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      },
    });

    // Ensure Aditya Tanwar
    await prisma.member.upsert({
      where: { email: 'adityatanwar13827@gmail.com' },
      update: {
        name: 'Aditya Tanwar',
        role: 'student',
        headline: 'Full-Stack & Systems Builder',
        institution: 'IIIT Delhi',
      },
      create: {
        email: 'adityatanwar13827@gmail.com',
        name: 'Aditya Tanwar',
        role: 'student',
        headline: 'Full-Stack & Systems Builder',
        institution: 'IIIT Delhi',
        verificationStatus: 'verified_student',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['React', 'Next.js', 'Python', 'FastAPI', 'TypeScript', 'Node.js']),
        bio: 'Undergraduate CS builder at IIIT Delhi specializing in full-stack architecture, distributed systems, and modern AI engineering.',
      },
    });

    // Ensure Parteek Garg
    await prisma.member.upsert({
      where: { email: 'raycray6291@gmail.com' },
      update: {
        name: 'Parteek Garg',
        role: 'student',
        headline: 'AI Systems & Full-Stack Engineer',
        institution: 'IIIT Delhi',
      },
      create: {
        email: 'raycray6291@gmail.com',
        name: 'Parteek Garg',
        role: 'student',
        headline: 'AI Systems & Full-Stack Engineer',
        institution: 'IIIT Delhi',
        verificationStatus: 'verified_student',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['Next.js', 'TypeScript', 'Python', 'FastAPI', 'PyTorch', 'Docker']),
        bio: 'Computer Science & Engineering student at IIIT Delhi building real-time collaboration engines, neural interfaces, and autonomous agent systems.',
      },
    });

    // Ensure Darsh Ohri
    await prisma.member.upsert({
      where: { email: 'darshohri@gmail.com' },
      update: {
        name: 'Darsh Ohri',
        role: 'student',
        headline: 'Full-Stack & AI Systems Builder',
        institution: 'IIIT Delhi',
      },
      create: {
        email: 'darshohri@gmail.com',
        name: 'Darsh Ohri',
        role: 'student',
        headline: 'Full-Stack & AI Systems Builder',
        institution: 'IIIT Delhi',
        verificationStatus: 'verified',
        avatarUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJD07Sl5ZO6IYuFR54sitam2lvez5m0LsN3GZz1VE0uKiS1nQ=s96-c',
        skills: JSON.stringify(['React', 'Next.js', 'FastAPI', 'TypeScript', 'Python', 'LLMs']),
        bio: 'Computer Science & Engineering undergraduate (Data Science specialization) and full-stack developer with 6+ shipped AI-integrated web applications.',
      },
    });

    // Ensure Nipun Dhiman
    await prisma.member.upsert({
      where: { email: 'nipun2108dhiman@gmail.com' },
      update: {
        name: 'Nipun Dhiman',
        role: 'student',
        headline: 'Computer Science & Cloud Systems',
        institution: 'IIIT Delhi',
      },
      create: {
        email: 'nipun2108dhiman@gmail.com',
        name: 'Nipun Dhiman',
        role: 'student',
        headline: 'Computer Science & Cloud Systems',
        institution: 'IIIT Delhi',
        verificationStatus: 'verified_student',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['TypeScript', 'React', 'Go', 'PostgreSQL', 'TailwindCSS']),
        bio: 'B.Tech Computer Science student at IIIT Delhi passionate about cloud-native infrastructure, distributed systems, and web performance.',
      },
    });

    // 2. Add/Upsert 3 verified alumni
    await prisma.member.upsert({
      where: { email: 'rohan.malhotra@alumni.iiitd.ac.in' },
      update: {
        name: 'Rohan Malhotra',
        role: 'alumni',
        headline: 'Senior Staff Software Engineer @ Google',
        institution: 'IIIT Delhi (Alumni \'21)',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      },
      create: {
        email: 'rohan.malhotra@alumni.iiitd.ac.in',
        name: 'Rohan Malhotra',
        role: 'alumni',
        headline: 'Senior Staff Software Engineer @ Google',
        institution: 'IIIT Delhi (Alumni \'21)',
        graduationYear: '2021',
        verificationStatus: 'verified',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['Distributed Systems', 'Kubernetes', 'Go', 'GCP', 'System Design']),
        bio: 'IIIT Delhi Class of 2021. Currently leading infrastructure engineering at Google Cloud. Mentoring students on scalable systems, career transitions, and backend architecture.',
        linkedinUrl: 'https://linkedin.com',
        githubUrl: 'https://github.com',
      },
    });

    await prisma.member.upsert({
      where: { email: 'vikram.sen@alumni.iiitd.ac.in' },
      update: {
        name: 'Vikramaditya Sen',
        role: 'alumni',
        headline: 'Principal AI Research Engineer @ Anthropic',
        institution: 'IIIT Delhi (Alumni \'19)',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      },
      create: {
        email: 'vikram.sen@alumni.iiitd.ac.in',
        name: 'Vikramaditya Sen',
        role: 'alumni',
        headline: 'Principal AI Research Engineer @ Anthropic',
        institution: 'IIIT Delhi (Alumni \'19)',
        graduationYear: '2019',
        verificationStatus: 'verified',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['PyTorch', 'LLMs', 'RLHF', 'CUDA', 'Python', 'MLOps']),
        bio: 'IIIT Delhi Alumni \'19. Working on frontier LLM alignment and inference optimization. Passionate about empowering university builders with practical AI skills.',
        linkedinUrl: 'https://linkedin.com',
        githubUrl: 'https://github.com',
      },
    });

    await prisma.member.upsert({
      where: { email: 'arjun.kapoor@alumni.iiitd.ac.in' },
      update: {
        name: 'Arjun Kapoor',
        role: 'alumni',
        headline: 'Engineering Manager @ Stripe',
        institution: 'IIIT Delhi (Alumni \'20)',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
      },
      create: {
        email: 'arjun.kapoor@alumni.iiitd.ac.in',
        name: 'Arjun Kapoor',
        role: 'alumni',
        headline: 'Engineering Manager @ Stripe',
        institution: 'IIIT Delhi (Alumni \'20)',
        graduationYear: '2020',
        verificationStatus: 'verified',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
        skills: JSON.stringify(['Payments Infra', 'Ruby', 'Java', 'FinTech', 'Engineering Leadership']),
        bio: 'Alumni \'20. Building global billing and financial infrastructure at Stripe. Happy to review student projects and guide on software engineering leadership.',
        linkedinUrl: 'https://linkedin.com',
        githubUrl: 'https://github.com',
      },
    });

    // 3. Fix Aditya Sharma post avatar (male portrait)
    const maleAvatarUrl = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80';
    await prisma.post.updateMany({
      where: {
        OR: [
          { authorName: 'Aditya Sharma' },
          { id: 'cmvcvd8k5000riahv2uy82b25' },
        ],
      },
      data: {
        authorAvatar: maleAvatarUrl,
      },
    });
  } catch (err) {
    console.warn('[Seed Warning]', err);
  }
}
