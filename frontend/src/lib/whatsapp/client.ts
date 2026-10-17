import { waConfig } from './config';
import { normalizePhone, maskPhone } from './phone';
import { prisma } from '../prisma';

export interface MetaApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

export class WhatsAppError extends Error {
  public code: number;
  public userFriendlyMessage: string;
  public details?: any;

  constructor(code: number, rawMessage: string, details?: any) {
    const userFriendlyMessage = WhatsAppError.mapErrorCode(code, rawMessage);
    super(`[WhatsApp Error ${code}] ${userFriendlyMessage}`);
    this.name = 'WhatsAppError';
    this.code = code;
    this.userFriendlyMessage = userFriendlyMessage;
    this.details = details;
  }

  static mapErrorCode(code: number, rawMessage: string): string {
    switch (code) {
      case 131047:
        return 'Re-engagement message blocked: more than 24 hours have passed since the user last messaged you. An approved template message is required.';
      case 131026:
        return 'Message undeliverable: the recipient phone number is not registered or cannot receive WhatsApp messages.';
      case 130429:
        return 'Rate limit exceeded: too many messages sent in a short interval. Backing off.';
      case 132000:
        return 'Template mismatch: variable count or formatting does not match the approved Meta template.';
      case 190:
        return 'Access Token expired or invalid: please update WA_ACCESS_TOKEN in your environment.';
      default:
        return rawMessage || 'An unexpected error occurred during WhatsApp message delivery.';
    }
  }
}

export function isWithin24HourWindow(lastInboundAt: Date | string | null | undefined): boolean {
  if (!lastInboundAt) return false;
  const lastInboundTime = new Date(lastInboundAt).getTime();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  return Date.now() - lastInboundTime < twentyFourHoursMs;
}

interface RequestOptions {
  maxRetries?: number;
  correlationId?: string;
}

export class WhatsAppClient {
  private async executeWithRetry(
    payload: any,
    options: RequestOptions = {}
  ): Promise<{ messageId?: string; raw: any }> {
    // Development and automated testing mock mode
    if (process.env.WA_MOCK_CLIENT === 'true' || waConfig.accessToken === 'mock_wa_access_token') {
      const mockId = `wamid.MOCK_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return { messageId: mockId, raw: { messaging_product: 'whatsapp', messages: [{ id: mockId }] } };
    }

    const maxRetries = options.maxRetries ?? 3;
    const url = waConfig.apiUrl + '/messages';
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${waConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const status = response.status;
          const errorObj = (data as MetaApiErrorResponse)?.error;
          const errorCode = errorObj?.code || status;
          const errorMessage = errorObj?.message || response.statusText;

          // Retry only on 429 (Rate Limit) or 5xx server errors
          const isRetryable = status === 429 || (status >= 500 && status < 600);

          if (isRetryable && attempt < maxRetries) {
            attempt++;
            const backoffMs = Math.pow(2, attempt) * 500 + Math.random() * 200;
            console.warn(
              `[WhatsApp Retry] Attempt ${attempt}/${maxRetries} after ${Math.round(backoffMs)}ms due to status ${status}`
            );
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          throw new WhatsAppError(errorCode, errorMessage, errorObj);
        }

        const messageId = data?.messages?.[0]?.id;
        return { messageId, raw: data };
      } catch (err: any) {
        if (err instanceof WhatsAppError) {
          throw err;
        }

        // Network connection error
        if (attempt < maxRetries) {
          attempt++;
          const backoffMs = Math.pow(2, attempt) * 500;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        throw new WhatsAppError(500, err?.message || 'Network request failed');
      }
    }

    throw new WhatsAppError(500, 'Max retries exhausted');
  }

  /**
   * Sends free-form text message. Validates the 24-hour customer support window.
   */
  async sendText(
    to: string,
    body: string,
    options?: { contactId?: string; correlationId?: string }
  ): Promise<{ messageId?: string }> {
    const normalized = normalizePhone(to);
    if (!normalized.isValid) {
      throw new Error(`Invalid recipient phone: ${normalized.error}`);
    }

    // 24-Hour Window Rule check if contact exists
    let contact = null;
    if (options?.contactId) {
      contact = await prisma.whatsappContact.findUnique({ where: { id: options.contactId } });
    } else {
      contact = await prisma.whatsappContact.findUnique({ where: { phoneE164: normalized.e164 } });
    }

    if (contact && !isWithin24HourWindow(contact.lastInboundAt)) {
      console.warn(
        `[WhatsApp 24h Window Violation] ${maskPhone(normalized.e164)} last messaged at ${contact.lastInboundAt}. Free-form text blocked.`
      );
      throw new WhatsAppError(
        131047,
        'Cannot send free-form text outside 24h window. Use an approved template.'
      );
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalized.digitsOnly,
      type: 'text',
      text: {
        preview_url: false,
        body,
      },
    };

    console.log(`[WhatsApp Outbound] Sending text to ${maskPhone(normalized.e164)}`);
    const result = await this.executeWithRetry(payload, { correlationId: options?.correlationId });

    if (result.messageId && contact) {
      await prisma.whatsappMessage.create({
        data: {
          waMessageId: result.messageId,
          contactId: contact.id,
          direction: 'outbound',
          type: 'text',
          body,
          status: 'sent',
        },
      });
    }

    return { messageId: result.messageId };
  }

  /**
   * Sends an approved template message. Templates are permitted outside the 24-hour window.
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = 'en',
    components: any[] = [],
    options?: { contactId?: string; correlationId?: string }
  ): Promise<{ messageId?: string }> {
    const normalized = normalizePhone(to);
    if (!normalized.isValid) {
      throw new Error(`Invalid recipient phone: ${normalized.error}`);
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalized.digitsOnly,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components.length > 0 ? components : undefined,
      },
    };

    console.log(
      `[WhatsApp Outbound] Sending template '${templateName}' to ${maskPhone(normalized.e164)}`
    );
    const result = await this.executeWithRetry(payload, { correlationId: options?.correlationId });

    if (result.messageId) {
      let contact = options?.contactId
        ? await prisma.whatsappContact.findUnique({ where: { id: options.contactId } })
        : await prisma.whatsappContact.findUnique({ where: { phoneE164: normalized.e164 } });

      if (!contact) {
        contact = await prisma.whatsappContact.create({
          data: {
            phoneE164: normalized.e164,
            language: languageCode,
          },
        });
      }

      await prisma.whatsappMessage.create({
        data: {
          waMessageId: result.messageId,
          contactId: contact.id,
          direction: 'outbound',
          type: 'template',
          templateName,
          status: 'sent',
        },
      });
    }

    return { messageId: result.messageId };
  }

  /**
   * Sends interactive quick reply buttons (max 3 buttons allowed by Meta).
   */
  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    options?: { headerText?: string; footerText?: string; contactId?: string }
  ): Promise<{ messageId?: string }> {
    if (buttons.length > 3) {
      throw new Error('Meta WhatsApp Cloud API allows a maximum of 3 interactive buttons.');
    }

    const normalized = normalizePhone(to);
    if (!normalized.isValid) throw new Error('Invalid phone');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalized.digitsOnly,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: options?.headerText ? { type: 'text', text: options.headerText } : undefined,
        body: { text: bodyText },
        footer: options?.footerText ? { text: options.footerText } : undefined,
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: {
              id: b.id,
              title: b.title.slice(0, 20), // Meta limit 20 chars
            },
          })),
        },
      },
    };

    const result = await this.executeWithRetry(payload);
    return { messageId: result.messageId };
  }

  /**
   * Sends an interactive list menu (up to 10 rows per section).
   */
  async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    options?: { headerText?: string; footerText?: string }
  ): Promise<{ messageId?: string }> {
    const normalized = normalizePhone(to);
    if (!normalized.isValid) throw new Error('Invalid phone');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: normalized.digitsOnly,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: options?.headerText ? { type: 'text', text: options.headerText } : undefined,
        body: { text: bodyText },
        footer: options?.footerText ? { text: options.footerText } : undefined,
        action: {
          button: buttonText.slice(0, 20),
          sections: sections.map((sec) => ({
            title: sec.title.slice(0, 24),
            rows: sec.rows.map((r) => ({
              id: r.id,
              title: r.title.slice(0, 24),
              description: r.description ? r.description.slice(0, 72) : undefined,
            })),
          })),
        },
      },
    };

    const result = await this.executeWithRetry(payload);
    return { messageId: result.messageId };
  }

  /**
   * Marks an incoming message as read (two blue ticks in WhatsApp).
   */
  async markAsRead(messageId: string): Promise<boolean> {
    const payload = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    };

    try {
      await this.executeWithRetry(payload);
      return true;
    } catch (e) {
      console.warn(`[WhatsApp markAsRead] Failed to mark ${messageId} as read:`, e);
      return false;
    }
  }

  /**
   * Emulates typing indicator / read acknowledgement.
   */
  async sendTypingIndicator(messageId: string): Promise<void> {
    await this.markAsRead(messageId);
  }

  /**
   * Fetches media metadata from Meta Graph API
   */
  async getMediaMetadata(mediaId: string): Promise<{ url: string; mimeType: string; fileSize?: number }> {
    if (process.env.WA_MOCK_CLIENT === 'true' || waConfig.accessToken === 'mock_wa_access_token') {
      return {
        url: `https://mock.graph.facebook.com/media/${mediaId}`,
        mimeType: 'audio/ogg; codecs=opus',
        fileSize: 48000,
      };
    }

    const url = `https://graph.facebook.com/${waConfig.graphVersion}/${mediaId}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${waConfig.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch media metadata for ${mediaId}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      url: data.url,
      mimeType: data.mime_type,
      fileSize: data.file_size,
    };
  }

  /**
   * Downloads binary media content using Bearer token authorization
   */
  async downloadMedia(mediaId: string): Promise<{ buffer: Buffer; mimeType: string; fileSize: number }> {
    if (process.env.WA_MOCK_CLIENT === 'true' || waConfig.accessToken === 'mock_wa_access_token') {
      const mockAudio = Buffer.from('RIFF mock audio buffer ogg opus voice note', 'utf-8');
      return {
        buffer: mockAudio,
        mimeType: 'audio/ogg; codecs=opus',
        fileSize: mockAudio.length,
      };
    }

    const meta = await this.getMediaMetadata(mediaId);
    const res = await fetch(meta.url, {
      headers: {
        Authorization: `Bearer ${waConfig.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download media content from Meta: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      buffer,
      mimeType: meta.mimeType,
      fileSize: buffer.length,
    };
  }
}

export const waClient = new WhatsAppClient();

