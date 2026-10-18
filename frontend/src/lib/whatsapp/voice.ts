import { waConfig } from './config';
import { maskPhone } from './phone';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export type KinSupportedLanguage =
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'pa'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml';

export interface TranscriptionResult {
  text: string;
  detectedLanguage: KinSupportedLanguage;
  durationSeconds?: number;
}

export interface TranscriptionProvider {
  transcribe(audioBuffer: Buffer, mimeType: string, filename?: string): Promise<TranscriptionResult>;
}

export class OpenAIWhisperProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || waConfig.transcriptionApiKey || '';
  }

  async transcribe(audioBuffer: Buffer, mimeType: string, filename = 'voice_note.ogg'): Promise<TranscriptionResult> {
    if (!this.apiKey || this.apiKey.startsWith('mock_')) {
      // Deterministic mock fallback for local testing without real API tokens
      return mockTranscribe(audioBuffer);
    }

    // Write temp file to comply with FormData / native fetch upload
    const tmpDir = os.tmpdir();
    const tmpFilePath = path.join(tmpDir, `kin_voice_${Date.now()}_${Math.random().toString(36).substring(7)}.ogg`);

    try {
      await fs.writeFile(tmpFilePath, audioBuffer);
      const fileBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });

      const isGroq = this.apiKey.startsWith('gsk_') || waConfig.transcriptionProvider === 'groq';
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/audio/transcriptions'
        : 'https://api.openai.com/v1/audio/transcriptions';
      const model = isGroq ? 'whisper-large-v3-turbo' : 'whisper-1';

      const formData = new FormData();
      formData.append('file', fileBlob, filename);
      formData.append('model', model);
      formData.append(
        'prompt',
        'Transcribe college alumni hiring, internship, and mentorship requirements in English, Hindi, Hinglish, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, or Malayalam.'
      );

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${isGroq ? 'Groq' : 'OpenAI'} Whisper API failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.text || '';
      const detected = detectLanguageFromText(rawText);

      return {
        text: rawText,
        detectedLanguage: detected,
        durationSeconds: data.duration,
      };
    } finally {
      // Prompt Rule: Delete the audio file immediately after transcription. Keep only the transcript.
      try {
        await fs.unlink(tmpFilePath).catch(() => {});
      } catch {
        // ignore cleanup error
      }
    }
  }
}

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    return mockTranscribe(audioBuffer);
  }
}

function mockTranscribe(buffer: Buffer): TranscriptionResult {
  const content = buffer.toString('utf-8');
  if (content.includes('hindi') || content.includes('chahiye')) {
    return {
      text: 'Mujhe 2 React developer chahiye Delhi me startup ke liye.',
      detectedLanguage: 'hinglish',
      durationSeconds: 15,
    };
  }
  return {
    text: 'I need two React and TypeScript interns in Delhi starting next month for our campus venture.',
    detectedLanguage: 'en',
    durationSeconds: 22,
  };
}

export function detectLanguageFromText(text: string): KinSupportedLanguage {
  if (!text) return 'en';

  // 1. Script checks (Unicode blocks for Indic languages)
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Gurmukhi (Punjabi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0900-\u097F]/.test(text)) {
    // Check Marathi specific words in Devanagari
    if (/(आहे|पाहिजे|करावे|विद्यार्थी|मला|आमच्या)/.test(text)) {
      return 'mr';
    }
    return 'hi'; // Hindi
  }

  // 2. Romanized Script phonetic cues
  const lower = text.toLowerCase();

  // Punjabi Romanized
  if (/\b(mainu|chahida|chahide|lod hai|tuhanu|karna|pind|assi)\b/.test(lower)) {
    return 'pa';
  }
  // Bengali Romanized
  if (/\b(dorkar|amake|amar|lagbe|chai|bhalo|ekjon)\b/.test(lower)) {
    return 'bn';
  }
  // Tamil Romanized
  if (/\b(thevai|enakku|venum|vendum|paakanum|oru)\b/.test(lower)) {
    return 'ta';
  }
  // Telugu Romanized
  if (/\b(kavali|naku|undhi|undi|cheyali|oka|chudandi)\b/.test(lower)) {
    return 'te';
  }
  // Marathi Romanized
  if (/\b(pahije|mala|aahe|karaycha|amche)\b/.test(lower)) {
    return 'mr';
  }
  // Gujarati Romanized
  if (/\b(joiye|mane|che|maate|tamare)\b/.test(lower)) {
    return 'gu';
  }
  // Kannada Romanized
  if (/\b(beku|nanage|madabeku|kelsa|obba)\b/.test(lower)) {
    return 'kn';
  }
  // Malayalam Romanized
  if (/\b(aavashyamundu|enikku|venam|cheyyan|oral)\b/.test(lower)) {
    return 'ml';
  }

  // Hinglish colloquial cues
  const hinglishKeywords = [
    'chahiye', 'karna', 'karni', 'bhai', 'yaar', 'mujhe', 'humko', 'kisi',
    'kaam', 'intern', 'startup', 'zaroorat', 'jarurat', 'jaldi', 'delhi me',
    'batch', 'college', 'ke liye', 'wala', 'wali', 'karo', 'dost'
  ];
  const matchCount = hinglishKeywords.filter((w) => lower.includes(w)).length;
  if (matchCount >= 1) {
    return 'hinglish';
  }

  return 'en';
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (waConfig.transcriptionProvider === 'mock') {
    return new MockTranscriptionProvider();
  }
  return new OpenAIWhisperProvider(waConfig.transcriptionApiKey);
}

export const MAX_AUDIO_BYTES = 16 * 1024 * 1024; // 16 MB limit
export const MAX_AUDIO_DURATION_SECONDS = 120; // 2 minutes limit
