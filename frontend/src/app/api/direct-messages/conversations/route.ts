import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUserEmail = searchParams.get('currentUserEmail');

    if (!currentUserEmail) {
      return NextResponse.json({ success: false, error: 'currentUserEmail is required' }, { status: 400 });
    }

    const currentMember = await prisma.member.findUnique({
      where: { email: currentUserEmail },
    });

    if (!currentMember) {
      return NextResponse.json({ success: false, error: 'Current member not found' }, { status: 404 });
    }

    // Find all DMs involving currentMember
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentMember.id },
          { receiverId: currentMember.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        receiver: true,
      },
    });

    // Group by other user
    const conversationMap = new Map<string, any>();

    for (const msg of messages) {
      const other = msg.senderId === currentMember.id ? msg.receiver : msg.sender;
      if (!conversationMap.has(other.id)) {
        conversationMap.set(other.id, {
          otherMember: {
            id: other.id,
            name: other.name,
            email: other.email,
            role: other.role,
            headline: other.headline,
            institution: other.institution,
            avatarUrl: other.avatarUrl,
          },
          lastMessage: {
            id: msg.id,
            content: msg.content,
            isSender: msg.senderId === currentMember.id,
            createdAt: msg.createdAt.toISOString(),
            read: msg.read,
          },
          unreadCount: msg.receiverId === currentMember.id && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(other.id);
        if (msg.receiverId === currentMember.id && !msg.read) {
          conv.unreadCount += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error: any) {
    console.error('[API /api/direct-messages/conversations Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
