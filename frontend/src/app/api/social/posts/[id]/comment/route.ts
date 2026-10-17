import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      comments: comments.map((c: any) => ({
        id: c.id,
        authorName: c.authorName,
        authorRole: c.authorRole,
        content: c.content,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('[API /api/social/posts/[id]/comment GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await req.json();
    const {
      content,
      authorName = 'Verified Builder',
      authorRole = 'Member',
      userEmail,
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Comment cannot be empty' }, { status: 400 });
    }

    let memberId: string | undefined;
    if (userEmail) {
      const member = await prisma.member.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      if (member) memberId = member.id;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        memberId: memberId ?? undefined,
        authorName: authorName.trim(),
        authorRole: authorRole.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        authorName: comment.authorName,
        authorRole: comment.authorRole,
        content: comment.content,
        createdAt: comment.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[API /api/social/posts/[id]/comment POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
