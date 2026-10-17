import { NextRequest, NextResponse } from 'next/server';
import { waConfig } from '@/lib/whatsapp/config';
import { verifyMetaSignature } from '@/lib/whatsapp/security';
import { prisma } from '@/lib/prisma';
import { normalizePhone, maskPhone } from '@/lib/whatsapp/phone';
import { waClient } from '@/lib/whatsapp/client';
import { processInboundFlow } from '@/lib/whatsapp/flows';

export const dynamic = 'force-dynamic';

/**
 * GET: Meta Webhook Verification Handshake
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === waConfig.verifyToken) {
    console.log('[WhatsApp Webhook] Meta challenge verified successfully.');
    return new Response(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  console.warn('[WhatsApp Webhook] Forbidden webhook challenge verification attempt.');
  return new Response('Forbidden', { status: 403 });
}

/**
 * POST: Inbound Messages & Status Updates
 */
export async function POST(req: NextRequest) {
  const signatureHeader = req.headers.get('x-hub-signature-256');
  const rawBody = await req.text();

  // 1. Verify Meta HMAC-SHA256 signature
  const isSignatureValid = verifyMetaSignature(rawBody, signatureHeader, waConfig.appSecret);
  if (!isSignatureValid) {
    console.error('[WhatsApp Webhook] 401 Unauthorized: Invalid X-Hub-Signature-256');
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  // 2. Persist raw event immediately for audit and replay
  let webhookEventId = '';
  try {
    const savedEvent = await prisma.webhookEvent.create({
      data: {
        payload: rawBody,
      },
    });
    webhookEventId = savedEvent.id;
  } catch (dbErr) {
    console.warn('[WhatsApp Webhook] Failed to record raw event to DB:', dbErr);
  }

  // 3. Trigger asynchronous background processing (never block the 200 OK response to Meta)
  (async () => {
    try {
      await processWebhookPayload(rawBody);
      if (webhookEventId) {
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: { processedAt: new Date() },
        });
      }
    } catch (err: any) {
      console.error('[WhatsApp Webhook Async Processing Error]:', err);
      if (webhookEventId) {
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: { error: err?.message || 'Processing failed' },
        });
      }
    }
  })();

  // 4. Return 200 OK immediately within 2 seconds
  return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
}

async function processWebhookPayload(rawBody: string): Promise<void> {
  const json = JSON.parse(rawBody);
  const entries = json?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];
    for (const change of changes) {
      const value = change?.value;
      if (!value) continue;

      // Handle Delivery Status Updates (sent, delivered, read, failed)
      if (value.statuses && Array.isArray(value.statuses)) {
        for (const statusItem of value.statuses) {
          const waMessageId = statusItem.id;
          const status = statusItem.status; // "sent" | "delivered" | "read" | "failed"
          const errorCode = statusItem.errors?.[0]?.code ? String(statusItem.errors[0].code) : null;

          if (errorCode) {
            console.warn(
              `[WhatsApp Status Failed] Message ${waMessageId} failed with code ${errorCode}: ${statusItem.errors?.[0]?.message}`
            );
          }

          await prisma.whatsappMessage.updateMany({
            where: { waMessageId },
            data: {
              status,
              ...(errorCode ? { errorCode } : {}),
            },
          });
        }
      }

      // Handle Inbound Messages
      if (value.messages && Array.isArray(value.messages)) {
        for (const msg of value.messages) {
          const waMessageId = msg.id;

          // Idempotency: Skip duplicates
          const existingMessage = await prisma.whatsappMessage.findUnique({
            where: { waMessageId },
          });

          if (existingMessage) {
            console.log(`[WhatsApp Inbound Idempotency] Skipping duplicate message ${waMessageId}`);
            continue;
          }

          // Normalize sender phone
          const senderRaw = msg.from; // e.g. "919811022678"
          const normalized = normalizePhone(senderRaw.startsWith('+') ? senderRaw : `+${senderRaw}`);
          if (!normalized.isValid) {
            console.warn(`[WhatsApp Inbound] Invalid sender phone: ${senderRaw}`);
            continue;
          }

          const now = new Date(Number(msg.timestamp) * 1000 || Date.now());

          // Upsert contact & update last_inbound_at (opens the 24h window)
          const contact = await prisma.whatsappContact.upsert({
            where: { phoneE164: normalized.e164 },
            create: {
              phoneE164: normalized.e164,
              lastInboundAt: now,
            },
            update: {
              lastInboundAt: now,
            },
          });

          console.log(`[WhatsApp Inbound] Received from ${maskPhone(contact.phoneE164)}: type=${msg.type}`);

          // Extract message content
          let bodyText = '';
          let buttonId: string | undefined;
          let listRowId: string | undefined;
          let mediaId: string | undefined;
          const msgType = msg.type;

          if (msgType === 'text') {
            bodyText = msg.text?.body || '';
          } else if (msgType === 'interactive') {
            if (msg.interactive?.type === 'button_reply') {
              buttonId = msg.interactive.button_reply?.id;
              bodyText = msg.interactive.button_reply?.title || '';
            } else if (msg.interactive?.type === 'list_reply') {
              listRowId = msg.interactive.list_reply?.id;
              bodyText = msg.interactive.list_reply?.title || '';
            }
          } else if (msgType === 'audio') {
            mediaId = msg.audio?.id;
            bodyText = '[Voice Note]';
          } else {
            bodyText = `[Media: ${msgType}]`;
          }

          // Persist inbound message
          await prisma.whatsappMessage.create({
            data: {
              waMessageId,
              contactId: contact.id,
              direction: 'inbound',
              type: msgType,
              body: bodyText,
              status: 'received',
            },
          });

          // Mark as read in WhatsApp
          await waClient.markAsRead(waMessageId);

          // Get active conversation state
          const conversationState = await prisma.whatsappConversationState.findUnique({
            where: { contactId: contact.id },
          });

          // Route to flow state machine
          await processInboundFlow({
            contact,
            conversationState,
            incomingText: bodyText !== '[Voice Note]' && !bodyText.startsWith('[Media') ? bodyText : undefined,
            buttonId,
            listRowId,
            mediaType: msgType,
            waMessageId,
            ...(mediaId ? { mediaId } : {}),
          } as any);
        }
      }
    }
  }
}

