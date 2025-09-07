import { api } from "encore.dev/api";
import { chatDB } from "./db";

export interface StartSessionRequest {
  userId: string;
  sessionType: "text" | "voice";
  language?: string;
  isAnonymous?: boolean;
}

export interface StartSessionResponse {
  sessionId: string;
  message: string;
}

// Starts a new chat session
export const startSession = api<StartSessionRequest, StartSessionResponse>(
  { expose: true, method: "POST", path: "/chat/start" },
  async (req) => {
    const { userId, sessionType, language = "en", isAnonymous = false } = req;

    const result = await chatDB.queryRow<{ id: string }>`
      INSERT INTO chat_sessions (user_id, session_type, language, is_anonymous)
      VALUES (${userId}, ${sessionType}, ${language}, ${isAnonymous})
      RETURNING id
    `;

    if (!result) {
      throw new Error("Failed to create chat session");
    }

    const welcomeMessage = getWelcomeMessage(language);

    await chatDB.exec`
      INSERT INTO chat_messages (session_id, sender, message)
      VALUES (${result.id}, 'ai', ${welcomeMessage})
    `;

    return {
      sessionId: result.id,
      message: welcomeMessage,
    };
  }
);

function getWelcomeMessage(language: string): string {
  const messages = {
    en: "Hello! I'm here to support you. How are you feeling today?",
    hi: "नमस्ते! मैं आपकी सहायता के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं?",
    es: "¡Hola! Estoy aquí para apoyarte. ¿Cómo te sientes hoy?",
  };
  return messages[language as keyof typeof messages] || messages.en;
}
