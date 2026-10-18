import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'public' | 'ghost' | 'all'
    const userEmail = searchParams.get('userEmail');

    const where: any = {};
    if (mode === 'ghost') {
      where.isGhost = true;
    } else if (mode === 'public') {
      where.isGhost = false;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
        likes: userEmail
          ? {
              where: { userEmail },
              select: { id: true },
            }
          : false,
      },
    });

    const formatted = posts.map((p: any) => {
      let parsedTags: string[] = [];
      try {
        parsedTags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags;
      } catch {
        parsedTags = [];
      }

      const isLiked = Array.isArray(p.likes) && p.likes.length > 0;

      return {
        id: p.id,
        author: {
          name: p.authorName,
          role: p.authorRole,
          institution: p.authorInstitution,
          avatar:
            p.authorName?.toLowerCase().includes('aditya') && p.authorAvatar?.includes('photo-1534528741775')
              ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
              : p.authorAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: p.content,
        timestamp: formatTimeAgo(p.createdAt),
        createdAt: p.createdAt,
        tags: parsedTags,
        likes: p.likesCount,
        isLiked,
        commentsCount: p.comments.length,
        comments: p.comments.map((c: any) => ({
          id: c.id,
          authorName: c.authorName,
          authorRole: c.authorRole,
          content: c.content,
          createdAt: c.createdAt,
          timeAgo: formatTimeAgo(c.createdAt),
        })),
        isGhost: p.isGhost,
        ghostPersona: p.ghostPersona,
      };
    });

    return NextResponse.json({
      success: true,
      posts: formatted,
    });
  } catch (error: any) {
    console.error('[API /api/social/posts GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      authorName = 'Verified Member',
      authorRole = 'Member',
      authorInstitution = 'KIN Network',
      authorAvatar,
      tags = ['#KIN'],
      isGhost = false,
      ghostPersona,
      userEmail,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Post content cannot be empty' }, { status: 400 });
    }

    let memberId: string | undefined;
    if (userEmail) {
      const member = await prisma.member.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      if (member) memberId = member.id;
    }

    const post = await prisma.post.create({
      data: {
        memberId: memberId ?? undefined,
        authorName: isGhost ? (ghostPersona || 'Ghost-Cadet-108') : authorName.trim(),
        authorRole: isGhost ? 'Anonymous • Verified' : authorRole.trim(),
        authorInstitution: isGhost ? 'Encrypted Identity' : authorInstitution?.trim(),
        authorAvatar: isGhost ? undefined : authorAvatar,
        content: content.trim(),
        tags: JSON.stringify(Array.isArray(tags) ? tags : [tags]),
        likesCount: 0,
        isGhost: Boolean(isGhost),
        ghostPersona: isGhost ? (ghostPersona || 'Ghost-Cadet-108') : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Post published to live feed!',
      post: {
        id: post.id,
        author: {
          name: post.authorName,
          role: post.authorRole,
          institution: post.authorInstitution,
          avatar: post.authorAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
          verified: true,
        },
        content: post.content,
        timestamp: 'Just now',
        createdAt: post.createdAt,
        tags: Array.isArray(tags) ? tags : [tags],
        likes: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        isGhost: post.isGhost,
        ghostPersona: post.ghostPersona,
      },
    });
  } catch (error: any) {
    console.error('[API /api/social/posts POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const diffSeconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}
