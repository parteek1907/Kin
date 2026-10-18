import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDatabaseSeeded } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSeeded();

    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'User email required' }, { status: 400 });
    }

    const currentMember = await prisma.member.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!currentMember) {
      return NextResponse.json({
        success: true,
        connections: [],
        pendingIncoming: [],
        pendingOutgoing: [],
      });
    }

    const memberId = currentMember.id;

    // Fetch all connections where user is sender or receiver
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: memberId }, { receiverId: memberId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            headline: true,
            institution: true,
            avatarUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
            headline: true,
            institution: true,
            avatarUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const accepted: any[] = [];
    const pendingIncoming: any[] = [];
    const pendingOutgoing: any[] = [];

    for (const c of connections) {
      const isSender = c.senderId === memberId;
      const partner = isSender ? c.receiver : c.sender;

      const item = {
        connectionId: c.id,
        status: c.status,
        note: c.note,
        createdAt: c.createdAt,
        partner,
      };

      if (c.status === 'accepted') {
        accepted.push(item);
      } else if (c.status === 'pending') {
        if (isSender) {
          pendingOutgoing.push(item);
        } else {
          pendingIncoming.push(item);
        }
      }
    }

    return NextResponse.json({
      success: true,
      connections: accepted,
      pendingIncoming,
      pendingOutgoing,
    });
  } catch (error: any) {
    console.error('[API /api/connections GET Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderEmail, receiverId, note } = body;

    if (!senderEmail || !receiverId) {
      return NextResponse.json({ success: false, error: 'senderEmail and receiverId are required' }, { status: 400 });
    }

    // Find sender member
    let sender = await prisma.member.findUnique({
      where: { email: senderEmail },
    });

    if (!sender) {
      // If user completed profile or has session, auto-create sender
      sender = await prisma.member.create({
        data: {
          email: senderEmail,
          name: body.senderName || 'Verified Builder',
          role: body.senderRole || 'student',
          headline: body.senderHeadline || 'Campus Builder',
          institution: body.senderInstitution || 'IIIT Delhi',
        },
      });
    }

    if (sender.id === receiverId) {
      return NextResponse.json({ success: false, error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Upsert connection
    const connection = await prisma.connection.upsert({
      where: {
        senderId_receiverId: {
          senderId: sender.id,
          receiverId,
        },
      },
      update: {
        status: 'pending',
        note: note ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        senderId: sender.id,
        receiverId,
        status: 'pending',
        note,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection request sent successfully!',
      connection,
    });
  } catch (error: any) {
    console.error('[API /api/connections POST Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { connectionId, action } = body; // action: 'accept' | 'decline'

    if (!connectionId || !action) {
      return NextResponse.json({ success: false, error: 'connectionId and action are required' }, { status: 400 });
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Connection request ${action === 'accept' ? 'accepted' : 'declined'}!`,
      connection: updated,
    });
  } catch (error: any) {
    console.error('[API /api/connections PATCH Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
