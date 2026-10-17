import { prisma } from '../prisma';
import { waClient } from './client';
import { TEMPLATES } from './templates';
import { maskPhone } from './phone';

export interface NotificationPreferences {
  newMatch?: boolean;
  trustRequest?: boolean;
  nodeVerified?: boolean;
  intentUpdate?: boolean;
  weeklyDigest?: boolean;
}

export class WhatsAppNotificationService {
  /**
   * Helper to verify if contact is eligible to receive notifications:
   * 1. Must be verified
   * 2. Must be opted in
   * 3. Must not be opted out
   * 4. Must have the specific notification preference enabled
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

    // Check verification & opt-in status
    if (!contact.verifiedAt || !contact.optedInAt || contact.optedOutAt) {
      console.log(
        `[WhatsApp Notification Skipped] ${maskPhone(contact.phoneE164)} is not opted-in or has opted out.`
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
   * Dispatches a match notification via conduit_new_match
   */
  async notifyNewMatch(params: {
    userId?: string;
    phoneE164?: string;
    intentTitle: string;
    matchName: string;
    fitPercentage: number;
  }) {
    const contact = await this.getEligibleContact(params, 'newMatch');
    if (!contact) return null;

    const templateDef = TEMPLATES.conduit_new_match;
    const validated = templateDef.schema.parse({
      intentTitle: params.intentTitle,
      matchName: params.matchName,
      fitPercentage: params.fitPercentage,
    });

    const components = templateDef.buildComponents(validated);
    return waClient.sendTemplate(
      contact.phoneE164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  }

  /**
   * Dispatches a trust edge request notification via conduit_trust_request
   */
  async notifyTrustRequest(params: {
    userId?: string;
    phoneE164?: string;
    requesterName: string;
    requestId: string;
  }) {
    const contact = await this.getEligibleContact(params, 'trustRequest');
    if (!contact) return null;

    const templateDef = TEMPLATES.conduit_trust_request;
    const validated = templateDef.schema.parse({
      requesterName: params.requesterName,
      requestId: params.requestId,
    });

    const components = templateDef.buildComponents(validated);
    return waClient.sendTemplate(
      contact.phoneE164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  }

  /**
   * Dispatches a node verification event via conduit_node_verified
   */
  async notifyNodeVerified(params: {
    userId?: string;
    phoneE164?: string;
    nodeTitle: string;
  }) {
    const contact = await this.getEligibleContact(params, 'nodeVerified');
    if (!contact) return null;

    const templateDef = TEMPLATES.conduit_node_verified;
    const validated = templateDef.schema.parse({
      nodeTitle: params.nodeTitle,
    });

    const components = templateDef.buildComponents(validated);
    return waClient.sendTemplate(
      contact.phoneE164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  }

  /**
   * Dispatches intent status change notification via conduit_intent_update
   */
  async notifyIntentUpdate(params: {
    userId?: string;
    phoneE164?: string;
    intentTitle: string;
    statusText: string;
  }) {
    const contact = await this.getEligibleContact(params, 'intentUpdate');
    if (!contact) return null;

    const templateDef = TEMPLATES.conduit_intent_update;
    const validated = templateDef.schema.parse({
      intentTitle: params.intentTitle,
      statusText: params.statusText,
    });

    const components = templateDef.buildComponents(validated);
    return waClient.sendTemplate(
      contact.phoneE164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  }

  /**
   * Dispatches weekly digest summary via conduit_weekly_digest
   */
  async notifyWeeklyDigest(params: {
    userId?: string;
    phoneE164?: string;
    activeNodes: number | string;
    newEdges: number | string;
    matchCount: number | string;
  }) {
    const contact = await this.getEligibleContact(params, 'weeklyDigest');
    if (!contact) return null;

    const templateDef = TEMPLATES.conduit_weekly_digest;
    const validated = templateDef.schema.parse({
      activeNodes: params.activeNodes,
      newEdges: params.newEdges,
      matchCount: params.matchCount,
    });

    const components = templateDef.buildComponents(validated);
    return waClient.sendTemplate(
      contact.phoneE164,
      templateDef.name,
      templateDef.language,
      components,
      { contactId: contact.id }
    );
  }
}

export const waNotifications = new WhatsAppNotificationService();
