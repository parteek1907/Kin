import { waClient } from '../client';
import { getTranscriptionProvider, MAX_AUDIO_BYTES, MAX_AUDIO_DURATION_SECONDS } from '../voice';
import { BackgroundJobPayload } from '../queue';
import { processInboundTextJob } from './textHandler';

export async function processInboundVoiceJob(payload: BackgroundJobPayload): Promise<void> {
  const { phoneE164, contactId, waMessageId, mediaId } = payload;
  if (!phoneE164 || !mediaId) {
    throw new Error('Missing phoneE164 or mediaId for voice job');
  }

  // 1. Mark as read immediately and send acknowledgement
  if (waMessageId) {
    await waClient.markAsRead(waMessageId);
  }
  await waClient.sendText(phoneE164, '🎙️ Got it, working on it…');

  try {
    // 2. Download audio binary with Bearer token authorization
    const media = await waClient.downloadMedia(mediaId);

    // 3. Check 16 MB limit
    if (media.fileSize > MAX_AUDIO_BYTES) {
      await waClient.sendText(
        phoneE164,
        '⚠️ Voice note is too large (exceeds 16 MB). Please send a shorter recording or text.'
      );
      return;
    }

    // 4. Transcribe using swappable provider (OpenAI Whisper default)
    const provider = getTranscriptionProvider();
    const result = await provider.transcribe(media.buffer, media.mimeType);

    // 5. Check 2-minute limit
    if (result.durationSeconds && result.durationSeconds > MAX_AUDIO_DURATION_SECONDS) {
      await waClient.sendText(
        phoneE164,
        '⚠️ Voice notes must be under 2 minutes. Please send a shorter voice note or type your requirement.'
      );
      return;
    }

    if (!result.text || result.text.trim().length === 0) {
      await waClient.sendText(
        phoneE164,
        "We couldn't hear any words in that recording. Please try typing your requirement as text."
      );
      return;
    }

    // 6. Chain into requirement extraction text handler
    await processInboundTextJob({
      phoneE164,
      contactId,
      waMessageId,
      text: result.text,
      extra: { isVoiceNote: true, detectedLanguage: result.detectedLanguage },
    });
  } catch (error: any) {
    console.error(`[Voice Note Error] Failed processing voice note:`, error);
    await waClient.sendText(
      phoneE164,
      "We couldn't transcribe that audio. Please type what you're looking for as a text message, and KIN will find matches!"
    );
  }
}
