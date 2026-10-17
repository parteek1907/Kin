import { prisma } from '../prisma';
import { waClient } from './client';
import {
  TEMPLATES,
  KinNewCandidateTemplateParams,
  KinIntroRequestTemplateParams,
  KinIntroAcceptedTemplateParams,
  KinFollowupTemplateParams,
  KinOtpTemplateParams,
} from './templates';
import { maskPhone } from './phone';

export interface NotificationPreferences {
  newCandidate?: boolean;
  introRequest?: boolean;
  introAccepted?: boolean;
  followup?: boolean;
}

export class WhatsAppNotificationService {
  /**
   * Helper to verify if contact is eligible to receive notifications:
   * 1. Must be opted in
   * 2. Must not be opted out
   * 3. Must have the specific notification preference enabled
   */
  private async getEligibleContact(
    identifier: { userId?: string; phoneE164?: string },
    preferenceKey: keyof NotificationPreferences
  ) {
    const contact = await prisma.whatsappContact.findFirst({
      where: {
        OR: [
          ...(identifier.userId ? [{ userId: identifier.userId }] : []),
          ...(identifier.phoneE164 ? [{ phoneE164: identifier.phoneE164 }] : []),
        ],
      },
    });

    if (!contact) return null;

    // Check opt-out status
    if (contact.optedOutAt) {
      console.log(
        `[WhatsApp Notification Skipped] ${maskPhone(contact.phoneE164)} has opted out.`
      );
      return null;
    }

    // Check preferences
    try {
      const prefs: NotificationPreferences = JSON.parse(contact.preferences || '{}');
      if (prefs[preferenceKey] === false) {
        console.log(
          `[WhatsApp Notification Skipped] ${maskPhone(contact.phoneE164)} disabled '${preferenceKey}'.`
        );
        return null;
      }
    } catch {
      // Default to allowed if preference JSON is corrupt
    }

    return contact;
  }

  /**
   * Event: New matching candidate joined or updated skills (max 1/day)
   */
  async notifyNewCandidate(
    identifier: { userId?: string; phoneE164?: string },
    params: KinNewCandidateTemplateParams
  ): Promise<boolean> {
    const contact = await this.getEligibleContact(identifier, 'newCandidate');
    if (!contact) return false;

    const templateDef = TEMPLATES.kin_new_candidate;
    const validated = templateDef.schema.parse(params);
    const components = templateDef.buildComponents(validated);

    await waClient.sendTemplate(
      contact.phoneE164,
      'kin_new_candidate',
      templateDef.language,
      components,
      { contactId: contact.id }
    );
    return true;
  }

  /**
   * Event: Double opt-in introduction request sent to candidate
   */
  async notifyIntroRequest(
    identifier: { userId?: string; phoneE164?: string },
    params: KinIntroRequestTemplateParams
  ): Promise<boolean> {
    const contact = await this.getEligibleContact(identifier, 'introRequest');
    if (!contact) return false;

    const templateDef = TEMPLATES.kin_intro_request;
    const validated = templateDef.schema.parse(params);
    const components = templateDef.buildComponents(validated);

    await waClient.sendTemplate(
      contact.phoneE164,
      'kin_intro_request',
      templateDef.language,
      components,
      { contactId: contact.id }
    );
    return true;
  }

  /**
   * Event: Introduction request accepted by candidate (contact link shared)
   */
  async notifyIntroAccepted(
    identifier: { userId?: string; phoneE164?: string },
    params: KinIntroAcceptedTemplateParams
  ): Promise<boolean> {
    const contact = await this.getEligibleContact(identifier, 'introAccepted');
    if (!contact) return false;

    const templateDef = TEMPLATES.kin_intro_accepted;
    const validated = templateDef.schema.parse(params);
    const components = templateDef.buildComponents(validated);

    await waClient.sendTemplate(
      contact.phoneE164,
      'kin_intro_accepted',
      templateDef.language,
      components,
      { contactId: contact.id }
    );
    return true;
  }

  /**
   * Event: 3-day follow up for open requirement
   */
  async notifyFollowup(
    identifier: { userId?: string; phoneE164?: string },
    params: KinFollowupTemplateParams
  ): Promise<boolean> {
    const contact = await this.getEligibleContact(identifier, 'followup');
    if (!contact) return false;

    const templateDef = TEMPLATES.kin_followup;
    const validated = templateDef.schema.parse(params);
    const components = templateDef.buildComponents(validated);

    await waClient.sendTemplate(
      contact.phoneE164,
      'kin_followup',
      templateDef.language,
      components,
      { contactId: contact.id }
    );
    return true;
  }

  /**
   * Event: Authentication / data deletion OTP
   */
  async notifyOtp(
    toPhone: string,
    params: KinOtpTemplateParams
  ): Promise<boolean> {
    const templateDef = TEMPLATES.kin_otp;
    const validated = templateDef.schema.parse(params);
    const components = templateDef.buildComponents(validated);

    await waClient.sendTemplate(
      toPhone,
      'kin_otp',
      templateDef.language,
      components
    );
    return true;
  }
}

export const waNotifications = new WhatsAppNotificationService();
