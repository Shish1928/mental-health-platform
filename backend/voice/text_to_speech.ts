import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

const geminiAPIKey = secret("GeminiAPIKey");

export interface TextToSpeechRequest {
  text: string;
  language?: string;
  voice?: string;
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration: number;
}

// Converts text to speech (placeholder for future TTS integration)
export const textToSpeech = api<TextToSpeechRequest, TextToSpeechResponse>(
  { expose: true, method: "POST", path: "/voice/tts" },
  async (req) => {
    const { text, language = "en", voice = "default" } = req;

    // In a real implementation, this would use Google Text-to-Speech or similar
    // For now, we'll return a placeholder response since we're using browser TTS
    
    // Estimate duration based on text length (average speaking rate)
    const wordsPerMinute = 150;
    const words = text.split(' ').length;
    const durationSeconds = (words / wordsPerMinute) * 60;

    return {
      audioUrl: "browser-tts", // Indicates to use browser's built-in TTS
      duration: Math.ceil(durationSeconds),
    };
  }
);
