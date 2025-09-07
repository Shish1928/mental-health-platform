import { api } from "encore.dev/api";
import { chatDB } from "./db";
import { secret } from "encore.dev/config";

const openAIKey = secret("OpenAIKey");

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  aiResponse: string;
  sentimentScore?: number;
  riskLevel: "low" | "medium" | "high";
}

// Sends a message and gets AI response
export const sendMessage = api<SendMessageRequest, SendMessageResponse>(
  { expose: true, method: "POST", path: "/chat/message" },
  async (req) => {
    const { sessionId, message } = req;

    // Get session info
    const session = await chatDB.queryRow<{
      id: string;
      language: string;
      user_id: string;
    }>`
      SELECT id, language, user_id
      FROM chat_sessions
      WHERE id = ${sessionId}
    `;

    if (!session) {
      throw new Error("Session not found");
    }

    // Analyze sentiment and risk
    const sentimentScore = await analyzeSentiment(message);
    const riskLevel = calculateRiskLevel(sentimentScore, message);

    // Store user message
    await chatDB.exec`
      INSERT INTO chat_messages (session_id, sender, message, sentiment_score, risk_level)
      VALUES (${sessionId}, 'user', ${message}, ${sentimentScore}, ${riskLevel})
    `;

    // Generate AI response
    const aiResponse = await generateAIResponse(message, session.language, sessionId);

    // Store AI response
    await chatDB.exec`
      INSERT INTO chat_messages (session_id, sender, message)
      VALUES (${sessionId}, 'ai', ${aiResponse})
    `;

    // Trigger emergency alert if high risk
    if (riskLevel === "high") {
      await triggerEmergencyAlert(session.user_id, message);
    }

    return {
      aiResponse,
      sentimentScore,
      riskLevel,
    };
  }
);

async function analyzeSentiment(message: string): Promise<number> {
  // Simple sentiment analysis - in production, use a proper ML model
  const negativeWords = ["sad", "depressed", "hopeless", "suicide", "hurt", "pain", "kill", "die"];
  const positiveWords = ["happy", "good", "great", "wonderful", "excellent", "amazing"];
  
  const lowerMessage = message.toLowerCase();
  let score = 0;
  
  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) score -= 0.2;
  });
  
  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) score += 0.2;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function calculateRiskLevel(sentimentScore: number, message: string): "low" | "medium" | "high" {
  const highRiskKeywords = ["suicide", "kill myself", "end it all", "want to die"];
  const mediumRiskKeywords = ["hopeless", "can't take it", "give up", "worthless"];
  
  const lowerMessage = message.toLowerCase();
  
  if (highRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "high";
  }
  
  if (mediumRiskKeywords.some(keyword => lowerMessage.includes(keyword)) || sentimentScore < -0.5) {
    return "medium";
  }
  
  return "low";
}

async function generateAIResponse(message: string, language: string, sessionId: string): Promise<string> {
  try {
    // Get conversation history
    const messages = await chatDB.queryAll<{ sender: string; message: string }>`
      SELECT sender, message
      FROM chat_messages
      WHERE session_id = ${sessionId}
      ORDER BY timestamp ASC
      LIMIT 10
    `;

    const conversation = messages.map(m => `${m.sender}: ${m.message}`).join('\n');
    
    const prompt = `You are a compassionate AI mental health support assistant. You provide empathetic, supportive responses using cognitive behavioral therapy (CBT) principles. Be warm, understanding, and encouraging. Ask open-ended questions to help the user explore their feelings. Always remind users that you're not a replacement for professional help.

Language: ${language}
Conversation history:
${conversation}

User: ${message}

Respond with empathy and support:`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm here to listen. Can you tell me more about how you're feeling?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm here to support you. Sometimes I have technical difficulties, but I'm listening. How can I help you today?";
  }
}

async function triggerEmergencyAlert(userId: string, message: string): Promise<void> {
  // In a real implementation, this would send alerts to counselors or emergency contacts
  console.log(`EMERGENCY ALERT for user ${userId}: ${message}`);
  
  // Store emergency alert
  await chatDB.exec`
    INSERT INTO chat_messages (session_id, sender, message)
    VALUES (${userId}, 'system', 'Emergency alert triggered - high risk message detected')
  `;
}
