import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currentUserEmail = searchParams.get('currentUserEmail');
    const otherUserId = searchParams.get('otherUserId');
    const otherUserEmail = searchParams.get('otherUserEmail');

    if (!currentUserEmail) {
      return NextResponse.json({ success: false, error: 'currentUserEmail is required' }, { status: 400 });
    }

    const currentMember = await prisma.member.findUnique({
      where: { email: currentUserEmail },
    });

    if (!currentMember) {
      return NextResponse.json({ success: false, error: 'Current member not found in database' }, { status: 404 });
    }

    let otherMember = null;
    if (otherUserId) {
      otherMember = await prisma.member.findUnique({ where: { id: otherUserId } });
    } else if (otherUserEmail) {
      otherMember = await prisma.member.findUnique({ where: { email: otherUserEmail } });
    }

    if (!otherMember) {
      return NextResponse.json({ success: false, error: 'Other member not found in database' }, { status: 404 });
    }

    // Mark received messages from this other member as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: otherMember.id,
        receiverId: currentMember.id,
        read: false,
      },
      data: { read: true },
    });

    // Fetch conversation thread
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentMember.id, receiverId: otherMember.id },
          { senderId: otherMember.id, receiverId: currentMember.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      receiverId: m.receiverId,
      isSender: m.senderId === currentMember.id,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      otherMember: {
        id: otherMember.id,
        name: otherMember.name,
        email: otherMember.email,
        role: otherMember.role,
        headline: otherMember.headline,
        institution: otherMember.institution,
        avatarUrl: otherMember.avatarUrl,
      },
      currentMemberId: currentMember.id,
    });
  } catch (error: any) {
    console.error('[API /api/direct-messages GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderEmail, receiverId, receiverEmail, content } = body;

    if (!senderEmail || !content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'senderEmail and content are required' }, { status: 400 });
    }

    const sender = await prisma.member.findUnique({
      where: { email: senderEmail },
    });

    if (!sender) {
      return NextResponse.json({ success: false, error: 'Sender member not found' }, { status: 404 });
    }

    let receiver = null;
    if (receiverId) {
      receiver = await prisma.member.findUnique({ where: { id: receiverId } });
    } else if (receiverEmail) {
      receiver = await prisma.member.findUnique({ where: { email: receiverEmail } });
    }

    if (!receiver) {
      return NextResponse.json({ success: false, error: 'Receiver member not found' }, { status: 404 });
    }

    if (sender.id === receiver.id) {
      return NextResponse.json({ success: false, error: 'Cannot send direct message to yourself' }, { status: 400 });
    }

    const directMessage = await prisma.directMessage.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        content: content.trim(),
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: directMessage.id,
        content: directMessage.content,
        senderId: directMessage.senderId,
        receiverId: directMessage.receiverId,
        isSender: true,
        read: directMessage.read,
        createdAt: directMessage.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[API /api/direct-messages POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
