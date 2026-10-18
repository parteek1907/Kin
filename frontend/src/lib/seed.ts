import { prisma } from './prisma';

/**
 * Ensures required students and alumni are always properly registered in the database,
 * corrupted entries fixed, duplicate entries eliminated, and Aditya Sharma has an Indian male portrait.
 */
export async function ensureDatabaseSeeded() {
  try {
    // 0. Purge all mock, fake, and placeholder member records
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

    // 1. Fix name / profile metadata for real accounts
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

    // Fix Aditya Sharma avatar if needed
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
  } catch (err) {
    console.warn('[Seed Warning]', err);
  }
}

