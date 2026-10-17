import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { maskPhone, normalizePhone } from '@/lib/whatsapp/phone';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json({ error: 'userId or phone is required' }, { status: 400 });
    }

    const contact = await prisma.whatsappContact.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(phone ? [{ phoneE164: normalizePhone(phone).e164 }] : []),
        ],
      },
    });

    if (!contact) {
      return NextResponse.json({
        linked: false,
        verified: false,
        phoneMasked: null,
        optedIn: false,
        preferences: {
          newMatch: true,
          trustRequest: true,
          nodeVerified: true,
          intentUpdate: true,
          weeklyDigest: true,
        },
      });
    }

    let preferences = {
      newMatch: true,
      trustRequest: true,
      nodeVerified: true,
      intentUpdate: true,
      weeklyDigest: true,
    };

    try {
      preferences = { ...preferences, ...JSON.parse(contact.preferences || '{}') };
    } catch {
      // Keep defaults
    }

    return NextResponse.json({
      linked: true,
      verified: Boolean(contact.verifiedAt),
      phoneMasked: maskPhone(contact.phoneE164),
      phoneE164: contact.phoneE164,
      optedIn: Boolean(contact.optedInAt && !contact.optedOutAt),
      preferences,
      lastInboundAt: contact.lastInboundAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone, preferences } = body;

    const contact = await prisma.whatsappContact.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(phone ? [{ phoneE164: normalizePhone(phone).e164 }] : []),
        ],
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const updated = await prisma.whatsappContact.update({
      where: { id: contact.id },
      data: {
        preferences: JSON.stringify(preferences || {}),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: JSON.parse(updated.preferences),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Unlink phone number & execute compliance data deletion path
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, phone } = body;

    const contact = await prisma.whatsappContact.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(phone ? [{ phoneE164: normalizePhone(phone).e164 }] : []),
        ],
      },
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Data-deletion path: unlinking removes the phone number and message bodies
    await prisma.$transaction([
      prisma.whatsappMessage.deleteMany({ where: { contactId: contact.id } }),
      prisma.whatsappOtp.deleteMany({ where: { contactId: contact.id } }),
      prisma.whatsappConversationState.deleteMany({ where: { contactId: contact.id } }),
      prisma.whatsappContact.delete({ where: { id: contact.id } }),
    ]);

    console.log(`[WhatsApp Data Deletion] Unlinked and purged all records for contact ${contact.id}`);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp number unlinked and associated message data deleted.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
