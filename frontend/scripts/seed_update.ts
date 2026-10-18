import { prisma } from '../src/lib/prisma';

async function run() {
  console.log('--- Starting Seed Update ---');

  // 0. Remove duplicate member records (e.g. builder@kin.network)
  await prisma.member.deleteMany({
    where: { email: 'builder@kin.network' },
  });

  // 1. Fix corrupted student records
  await prisma.member.updateMany({
    where: { email: 'adityatanwar13827@gmail.com' },
    data: {
      name: 'Aditya Tanwar',
      role: 'student',
      headline: 'Full-Stack & Systems Builder',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    },
  });

  await prisma.member.updateMany({
    where: { email: 'raycray6291@gmail.com' },
    data: {
      name: 'Parteek Garg',
      role: 'student',
      headline: 'AI Systems & Full-Stack Engineer',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  });

  await prisma.member.updateMany({
    where: { email: 'nipun2108dhiman@gmail.com' },
    data: {
      name: 'Nipun Dhiman',
      role: 'student',
      headline: 'Computer Science & Cloud Systems',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
  });

  // Ensure Single Aditya Sharma with local Indian male portrait
  await prisma.member.upsert({
    where: { email: 'aditya@iiitd.ac.in' },
    update: {
      name: 'Aditya Sharma',
      role: 'student',
      headline: 'Computer Science & AI Builder',
      institution: 'IIIT Delhi',
      avatarUrl: '/images/aditya_sharma.jpg',
    },
    create: {
      email: 'aditya@iiitd.ac.in',
      name: 'Aditya Sharma',
      role: 'student',
      headline: 'Computer Science & AI Builder',
      institution: 'IIIT Delhi',
      verificationStatus: 'verified_student',
      avatarUrl: '/images/aditya_sharma.jpg',
      skills: JSON.stringify(['React', 'Next.js', 'Python', 'FastAPI', 'PyTorch', 'TypeScript']),
      bio: 'Undergraduate CS builder at IIIT Delhi specializing in agentic workflows, high-concurrency backends, and full-stack systems.',
    },
  });

  // Ensure Aditya Tanwar exists
  await prisma.member.upsert({
    where: { email: 'adityatanwar13827@gmail.com' },
    update: {
      name: 'Aditya Tanwar',
      role: 'student',
      headline: 'Full-Stack & Systems Builder',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
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

  // Ensure Parteek Garg exists
  await prisma.member.upsert({
    where: { email: 'raycray6291@gmail.com' },
    update: {
      name: 'Parteek Garg',
      role: 'student',
      headline: 'AI Systems & Full-Stack Engineer',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
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

  // Ensure Darsh Ohri exists
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

  // Ensure Nipun Dhiman exists
  await prisma.member.upsert({
    where: { email: 'nipun2108dhiman@gmail.com' },
    update: {
      name: 'Nipun Dhiman',
      role: 'student',
      headline: 'Computer Science & Cloud Systems',
      institution: 'IIIT Delhi',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
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

  // Purge mock, fake, and placeholder member records
  await prisma.member.deleteMany({
    where: {
      email: {
        in: [
          'builder@kin.network',
          'rohan.malhotra@alumni.iiitd.ac.in',
          'vikram.sen@alumni.iiitd.ac.in',
          'arjun.kapoor@alumni.iiitd.ac.in',
        ],
      },
    },
  });

  // Fix Aditya Sharma's Post author avatar in the database to local Indian male portrait
  const maleAvatarUrl = '/images/aditya_sharma.jpg';
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

  console.log('--- Seed Update Complete ---');
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
