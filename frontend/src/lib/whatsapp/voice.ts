import { waConfig } from './config';
import { maskPhone } from './phone';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface TranscriptionResult {
  text: string;
  detectedLanguage: 'en' | 'hi' | 'hinglish';
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
      formData.append('prompt', 'Transcribe college alumni hiring, internship, and mentorship requirements in English, Hindi, or Hinglish.');

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

export function detectLanguageFromText(text: string): 'en' | 'hi' | 'hinglish' {
  if (!text) return 'en';

  // Check for Devanagari Unicode script range
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'hi';
  }

  // Check for Hinglish colloquial cues
  const hinglishKeywords = [
    'chahiye', 'karna', 'karni', 'bhai', 'yaar', 'mujhe', 'humko', 'kisi',
    'kaam', 'intern', 'startup', 'zaroorat', 'jarurat', 'jaldi', 'delhi me',
    'batch', 'college', 'ke liye', 'wala', 'wali', 'karo', 'dost'
  ];

  const lower = text.toLowerCase();
  const matchCount = hinglishKeywords.filter((w) => lower.includes(w)).length;
  if (matchCount >= 2) {
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
