import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await req.json();
    const userEmail = body.userEmail || 'anonymous@kin.network';

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userEmail: {
          postId,
          userEmail,
        },
      },
    });

    let liked = false;
    let newLikesCount = 0;

    if (existingLike) {
      // Unlike
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
        select: { likesCount: true },
      });
      liked = false;
      newLikesCount = Math.max(0, updated.likesCount);
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          postId,
          userEmail,
        },
      });
      const updated = await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
        select: { likesCount: true },
      });
      liked = true;
      newLikesCount = updated.likesCount;
    }

    return NextResponse.json({
      success: true,
      liked,
      likesCount: newLikesCount,
    });
  } catch (error: any) {
    console.error('[API /api/social/posts/[id]/like Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
