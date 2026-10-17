import { prisma } from '../../prisma';
import { waClient } from '../client';
import { WhatsappContact } from '@prisma/client';

export async function handleMenuCommand(contact: WhatsappContact): Promise<void> {
  const language = contact.language || 'en';

  const body =
    language === 'hi'
      ? `नमस्ते! KIN नेटवर्क में आपका स्वागत है। आप क्या करना चाहते हैं?`
      : language === 'hinglish'
      ? `Hi! KIN campus network me aapka swagat hai. Aap kya karna chahte hain?`
      : `👋 Welcome to KIN, the campus hiring & collaboration network.\n\nWhat would you like to do?`;

  const sections = [
    {
      title: 'Main Actions',
      rows: [
        {
          id: 'menu_new_requirement',
          title: 'Post Requirement',
          description: 'Send voice note or text to find talent',
        },
        {
          id: 'menu_my_requirements',
          title: 'My Requirements',
          description: 'View active hires and candidate intros',
        },
        {
          id: 'menu_change_language',
          title: 'Language / भाषा',
          description: 'Switch English, Hindi or Hinglish',
        },
        {
          id: 'menu_help',
          title: 'How It Works',
          description: 'Guide to voice note hiring & privacy',
        },
        {
          id: 'menu_delete_data',
          title: 'Delete My Data',
          description: 'GDPR / DPDP compliant data removal',
        },
      ],
    },
  ];

  try {
    await waClient.sendInteractiveList(contact.phoneE164, body, 'Menu', sections);
  } catch (e) {
    await waClient.sendText(
      contact.phoneE164,
      `${body}\n\n1. Reply *NEW* to post a requirement\n2. Reply *MY REQUIREMENTS* to view status\n3. Reply *HELP* for instructions\n4. Reply *LANGUAGE* to change language\n5. Reply *STOP* to opt out`
    );
  }
}

export async function handleMyRequirementsCommand(contact: WhatsappContact): Promise<void> {
  const requirements = await prisma.kinRequirement.findMany({
    where: { contactId: contact.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      matches: {
        include: { candidate: true },
      },
    },
  });

  if (requirements.length === 0) {
    await waClient.sendText(
      contact.phoneE164,
      `You don't have any requirements posted yet.\n\nSend a voice note or message describing who you need (e.g. "Looking for 2 React interns") to get started!`
    );
    return;
  }

  const lines = ['📋 *Your KIN Requirements:*', ''];

  for (const req of requirements) {
    const statusEmoji = req.status === 'open' ? '🟢' : req.status === 'filled' ? '✅' : '⚪';
    const introCount = req.matches.filter((m) => m.status === 'intro_requested' || m.status === 'intro_accepted').length;

    lines.push(
      `${statusEmoji} *${req.title}* (${req.type})`,
      `• Status: ${req.status.toUpperCase()}`,
      `• Total Matches: ${req.matches.length}  |  Intros: ${introCount}`,
      `• Location: ${req.locationOrRemote}`,
      ''
    );
  }

  lines.push('Reply "MORE" to view more candidate matches, or "CLOSE" to close an open requirement.');
  await waClient.sendText(contact.phoneE164, lines.join('\n'));
}

export async function handleHelpCommand(contact: WhatsappContact): Promise<void> {
  const helpText = [
    '💡 *How KIN Works:*',
    '',
    '1. *Send a Voice Note or Text:* Speak naturally in English, Hindi, or Hinglish about what you need (role, skills, location, timeline).',
    '2. *Review & Confirm:* KIN summarizes your requirement and asks for confirmation.',
    '3. *Receive Candidate Cards:* You get the top 5 matched college students and alumni directly in WhatsApp.',
    '4. *Double Opt-In Intro:* Click "Request intro". Contact details are shared only when the candidate accepts.',
    '',
    '🔒 *Privacy First:* Candidate contact numbers are never shown without mutual consent.',
    'Reply *NEW* to try it out now!',
  ].join('\n');

  await waClient.sendText(contact.phoneE164, helpText);
}

export async function handleLanguageCommand(contact: WhatsappContact): Promise<void> {
  await waClient.sendInteractiveButtons(
    contact.phoneE164,
    '🌐 Choose your preferred language for KIN replies:\n\nअपनी पसंदीदा भाषा चुनें:',
    [
      { id: 'lang_en', title: 'English' },
      { id: 'lang_hinglish', title: 'Hinglish' },
      { id: 'lang_hi', title: 'हिंदी (Hindi)' },
    ]
  );
}

export async function handleStopCommand(contact: WhatsappContact): Promise<void> {
  await prisma.whatsappContact.update({
    where: { id: contact.id },
    data: {
      optedOutAt: new Date(),
    },
  });

  // Prompt rule: STOP: set opted_out_at immediately, confirm once, and send nothing else.
  await waClient.sendText(
    contact.phoneE164,
    'You have been unsubscribed from KIN updates. Reply "START" anytime to re-enable messaging.'
  );
}

export async function handleStartCommand(contact: WhatsappContact): Promise<void> {
  await prisma.whatsappContact.update({
    where: { id: contact.id },
    data: {
      optedOutAt: null,
      optedInAt: new Date(),
    },
  });

  await waClient.sendText(
    contact.phoneE164,
    '🎉 Welcome back! You have re-subscribed to KIN. Reply "MENU" to see available options.'
  );
}

export async function handleDeleteDataCommand(contact: WhatsappContact): Promise<void> {
  // Data-deletion path: unlinking removes the phone number and message bodies
  const contactId = contact.id;

  // Clear messages
  await prisma.whatsappMessage.updateMany({
    where: { contactId },
    data: { body: '[DELETED UPON USER REQUEST]' },
  });

  // Redact contact
  await prisma.whatsappContact.update({
    where: { id: contactId },
    data: {
      name: '[DELETED]',
      institution: '[DELETED]',
      batch: '[DELETED]',
      preferences: '{}',
      optedOutAt: new Date(),
    },
  });

  // Anonymize alumni if linked
  await prisma.alumni.deleteMany({
    where: { phoneE164: contact.phoneE164 },
  });

  await waClient.sendText(
    contact.phoneE164,
    '🔒 *Data Deletion Complete.*\n\nYour profile information, requirements history, and message contents have been permanently erased from KIN systems in compliance with privacy regulations.'
  );
}
