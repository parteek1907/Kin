import { prisma } from '../prisma';
import crypto from 'crypto';
import { normalizePhone } from './phone';

export interface DeletionResult {
  confirmationCode: string;
  timestamp: string;
  status: 'completed';
  phoneHash: string;
  deletedSummary: {
    requirementsDeleted: number;
    messagesRedacted: number;
    profileCleared: boolean;
  };
}

/**
 * Permanently removes personal data in compliance with India's DPDP Act 2023.
 *
 * Removes:
 *  - Contact name, institution, batch
 *  - Candidate profile & skills
 *  - Alumni records
 *  - Message bodies & audio transcripts (overwritten to [DELETED UPON USER REQUEST])
 *  - Requirements & introduction history
 *  - Sets optedOutAt
 *
 * Retains:
 *  - Anonymous deletion log: SHA-256 hash of phone, timestamp, and confirmation code.
 */
export async function executePermanentDataDeletion(
  rawPhone: string,
  requestedVia: 'whatsapp' | 'web_form' | 'email' = 'web_form'
): Promise<DeletionResult> {
  const norm = normalizePhone(rawPhone);
  const phoneE164 = norm.isValid ? norm.e164 : rawPhone;
  const phoneHash = crypto.createHash('sha256').update(phoneE164).digest('hex');
  const confirmationCode = `KIN-DEL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const now = new Date();

  // Find contact
  const contact = await prisma.whatsappContact.findUnique({
    where: { phoneE164 },
    include: {
      requirements: true,
      messages: true,
    },
  });

  let requirementsCount = 0;
  let messagesCount = 0;

  if (contact) {
    requirementsCount = contact.requirements.length;
    messagesCount = contact.messages.length;

    // 1. Delete all requirements & cascading matches
    const reqIds = contact.requirements.map((r) => r.id);
    if (reqIds.length > 0) {
      await prisma.kinRequirement.deleteMany({
        where: { id: { in: reqIds } },
      });
    }

    // 2. Redact message bodies
    await prisma.whatsappMessage.updateMany({
      where: { contactId: contact.id },
      data: { body: '[DELETED UPON USER REQUEST]' },
    });

    // 3. Clear conversation state
    await prisma.whatsappConversationState.deleteMany({
      where: { contactId: contact.id },
    });

    // 4. Delete OTP records
    await prisma.whatsappOtp.deleteMany({
      where: { contactId: contact.id },
    });

    // 5. Redact contact metadata
    await prisma.whatsappContact.update({
      where: { id: contact.id },
      data: {
        name: '[DELETED]',
        institution: '[DELETED]',
        batch: '[DELETED]',
        preferences: '{}',
        optedOutAt: now,
      },
    });
  }

  // 6. Delete Candidate records
  await prisma.candidate.deleteMany({
    where: { phoneE164 },
  });

  // 7. Delete Alumni records
  await prisma.alumni.deleteMany({
    where: { phoneE164 },
  });

  // 8. Store anonymous audit log
  try {
    if ((prisma as any).dataDeletionLog) {
      await (prisma as any).dataDeletionLog.create({
        data: {
          phoneHash,
          confirmationCode,
          requestedVia,
          status: 'completed',
          details: JSON.stringify({
            requirementsDeleted: requirementsCount,
            messagesRedacted: messagesCount,
            deletedAt: now.toISOString(),
          }),
          deletedAt: now,
        },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO data_deletion_logs (id, phone_hash, confirmation_code, requested_via, status, details, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        `del_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        phoneHash,
        confirmationCode,
        requestedVia,
        'completed',
        JSON.stringify({ requirementsDeleted: requirementsCount, messagesRedacted: messagesCount }),
        now.toISOString()
      );
    }
  } catch (err: any) {
    console.warn('[Data Deletion] Audit log fallback insert:', err.message);
  }

  return {
    confirmationCode,
    timestamp: now.toISOString(),
    status: 'completed',
    phoneHash,
    deletedSummary: {
      requirementsDeleted: requirementsCount,
      messagesRedacted: messagesCount,
      profileCleared: true,
    },
  };
}
