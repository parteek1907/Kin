import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maskPhone } from '@/lib/whatsapp/phone';
import { waClient } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [messages, contactsCount, totalOutbound, failuresCount] = await Promise.all([
      prisma.whatsappMessage.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: {
            select: { phoneE164: true, verifiedAt: true, optedInAt: true, optedOutAt: true },
          },
        },
      }),
      prisma.whatsappContact.count(),
      prisma.whatsappMessage.count({ where: { direction: 'outbound' } }),
      prisma.whatsappMessage.count({ where: { status: 'failed' } }),
    ]);

    // Template counts
    const templateGroup = await prisma.whatsappMessage.groupBy({
      by: ['templateName'],
      where: {
        templateName: { not: null },
      },
      _count: {
        id: true,
      },
    });

    const templateStats = templateGroup.map((item) => ({
      templateName: item.templateName || 'custom',
      count: item._count.id,
    }));

    const sanitizedMessages = messages.map((m) => ({
      id: m.id,
      waMessageId: m.waMessageId,
      phoneMasked: maskPhone(m.contact.phoneE164),
      direction: m.direction,
      type: m.type,
      body: m.body,
      templateName: m.templateName,
      status: m.status,
      errorCode: m.errorCode,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      summary: {
        contactsCount,
        totalOutbound,
        failuresCount,
      },
      templateStats,
      messages: sanitizedMessages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: 'messageId is required' }, { status: 400 });
    }

    const failedMsg = await prisma.whatsappMessage.findUnique({
      where: { id: messageId },
      include: { contact: true },
    });

    if (!failedMsg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Attempt resend
    if (failedMsg.templateName) {
      const res = await waClient.sendTemplate(
        failedMsg.contact.phoneE164,
        failedMsg.templateName,
        'en',
        [],
        { contactId: failedMsg.contactId }
      );

      await prisma.whatsappMessage.update({
        where: { id: failedMsg.id },
        data: { status: 'sent', errorCode: null },
      });

      return NextResponse.json({ success: true, newMessageId: res.messageId });
    } else if (failedMsg.body) {
      const res = await waClient.sendText(failedMsg.contact.phoneE164, failedMsg.body, {
        contactId: failedMsg.contactId,
      });

      await prisma.whatsappMessage.update({
        where: { id: failedMsg.id },
        data: { status: 'sent', errorCode: null },
      });

      return NextResponse.json({ success: true, newMessageId: res.messageId });
    }

    return NextResponse.json({ error: 'Message has no replayable template or body' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
