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

    let currentMember = await prisma.member.findUnique({
      where: { email: currentUserEmail },
    });

    if (!currentMember) {
      // Auto-register member if signed in but not yet in Member table
      currentMember = await prisma.member.upsert({
        where: { email: currentUserEmail },
        update: {},
        create: {
          email: currentUserEmail,
          name: currentUserEmail.split('@')[0],
          role: 'student',
          headline: 'Verified Member',
          institution: 'IIIT Delhi',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUserEmail)}&backgroundColor=e25c38,1e293b&textColor=ffffff`,
        },
      });
    }

    // CASE 1: Fetch overall Inbox / active conversations
    if (!otherUserId && !otherUserEmail) {
      const allDms = await prisma.directMessage.findMany({
        where: {
          OR: [
            { senderId: currentMember.id },
            { receiverId: currentMember.id },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              headline: true,
              institution: true,
              avatarUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              headline: true,
              institution: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const conversationMap = new Map<string, any>();
      let totalUnreadCount = 0;

      for (const dm of allDms) {
        const isSender = dm.senderId === currentMember.id;
        const partner = isSender ? dm.receiver : dm.sender;
        if (!partner) continue;

        if (!conversationMap.has(partner.id)) {
          conversationMap.set(partner.id, {
            partner: {
              id: partner.id,
              name: partner.name,
              email: partner.email,
              role: partner.role,
              headline: partner.headline || (partner.role === 'student' ? 'Student Builder' : 'Tech Leader'),
              institution: partner.institution || 'IIIT Delhi',
              avatarUrl: partner.name?.toLowerCase().includes('aditya sharma')
                ? '/images/aditya_sharma.jpg'
                : (partner.avatarUrl || '/images/aditya_sharma.jpg'),
            },
            lastMessage: {
              id: dm.id,
              content: dm.content,
              createdAt: dm.createdAt.toISOString(),
              isSender,
              read: dm.read,
            },
            unreadCount: 0,
          });
        }

        if (!isSender && !dm.read) {
          const conv = conversationMap.get(partner.id);
          conv.unreadCount += 1;
          totalUnreadCount += 1;
        }
      }

      const conversations = Array.from(conversationMap.values());

      return NextResponse.json({
        success: true,
        conversations,
        totalUnreadCount,
        currentMemberId: currentMember.id,
      });
    }

    // CASE 2: Fetch 1-to-1 conversation thread with specific member
    let otherMember = null;
    if (otherUserId) {
      otherMember = await prisma.member.findUnique({ where: { id: otherUserId } });
    } else if (otherUserEmail) {
      otherMember = await prisma.member.findUnique({ where: { email: otherUserEmail } });
    }

    if (!otherMember) {
      return NextResponse.json({ success: false, error: 'Conversation partner not found in database' }, { status: 404 });
    }

    // Mark received messages from otherMember as read
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
        headline: otherMember.headline || (otherMember.role === 'student' ? 'Student Builder' : 'Tech Leader'),
        institution: otherMember.institution || 'IIIT Delhi',
        avatarUrl: otherMember.name?.toLowerCase().includes('aditya sharma')
          ? '/images/aditya_sharma.jpg'
          : (otherMember.avatarUrl || '/images/aditya_sharma.jpg'),
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
    const { senderEmail, senderName, receiverId, receiverEmail, content } = body;

    if (!senderEmail || !content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'senderEmail and content are required' }, { status: 400 });
    }

    let sender = await prisma.member.findUnique({
      where: { email: senderEmail },
    });

    if (!sender) {
      sender = await prisma.member.upsert({
        where: { email: senderEmail },
        update: {},
        create: {
          email: senderEmail,
          name: senderName?.trim() || senderEmail.split('@')[0],
          role: 'student',
          headline: 'Verified Member',
          institution: 'IIIT Delhi',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(senderEmail)}&backgroundColor=e25c38,1e293b&textColor=ffffff`,
        },
      });
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
