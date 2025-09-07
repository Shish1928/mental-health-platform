import { api } from "encore.dev/api";
import { voiceDB } from "./db";

export interface StartVoiceSessionRequest {
  userId: string;
  language?: string;
  isAnonymous?: boolean;
}

export interface StartVoiceSessionResponse {
  sessionId: string;
  message: string;
}

// Starts a new voice session
export const startVoiceSession = api<StartVoiceSessionRequest, StartVoiceSessionResponse>(
  { expose: true, method: "POST", path: "/voice/start" },
  async (req) => {
    const { userId, language = "en", isAnonymous = false } = req;

    const result = await voiceDB.queryRow<{ id: string }>`
      INSERT INTO voice_sessions (user_id, language, is_anonymous)
      VALUES (${userId}, ${language}, ${isAnonymous})
      RETURNING id
    `;

    if (!result) {
      throw new Error("Failed to create voice session");
    }

    const welcomeMessage = getWelcomeMessage(language);

    return {
      sessionId: result.id,
      message: welcomeMessage,
    };
  }
);

function getWelcomeMessage(language: string): string {
  const messages = {
    en: "Hello! I'm your voice assistant. I'm here to listen and support you. Feel free to speak naturally about whatever is on your mind.",
    hi: "नमस्ते! मैं आपका वॉयस असिस्टेंट हूँ। मैं आपकी बात सुनने और सहायता करने के लिए यहाँ हूँ। आप अपने मन की बात स्वतंत्र रूप से कह सकते हैं।",
    es: "¡Hola! Soy tu asistente de voz. Estoy aquí para escucharte y apoyarte. Siéntete libre de hablar naturalmente sobre lo que tengas en mente.",
  };
  return messages[language as keyof typeof messages] || messages.en;
}
