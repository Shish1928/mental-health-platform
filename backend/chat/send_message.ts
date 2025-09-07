import { api } from "encore.dev/api";
import { chatDB } from "./db";
import { secret } from "encore.dev/config";

const geminiAPIKey = secret("GeminiAPIKey");

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
    
    const prompt = `You are a compassionate AI mental health support assistant specialized in helping students. You provide empathetic, supportive responses using evidence-based therapeutic techniques like CBT and mindfulness. Be warm, understanding, and encouraging. Ask open-ended questions to help users explore their feelings. Always remind users that you're not a replacement for professional help when appropriate.

Key guidelines:
- Be empathetic and non-judgmental
- Use active listening techniques
- Offer practical coping strategies
- Validate the user's feelings
- Encourage professional help when needed
- Keep responses conversational and supportive (2-4 sentences)

Language: ${language}
Previous conversation:
${conversation}

Current user message: ${message}

Provide a supportive, therapeutic response:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiAPIKey()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 250,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fallback responses based on sentiment and risk level
    const fallbackResponses = {
      high: "I can hear that you're going through a really difficult time right now. Your feelings are valid, and I want you to know that you're not alone. Have you considered reaching out to a counselor or trusted friend for additional support?",
      medium: "It sounds like you're dealing with some challenging feelings. Thank you for sharing this with me - that takes courage. What do you think might help you feel a little more supported right now?",
      low: "I appreciate you sharing your thoughts with me. It's important to check in with ourselves regularly. What's one small thing that usually helps you feel a bit better when you're going through tough times?"
    };
    
    const riskLevel = calculateRiskLevel(await analyzeSentiment(message), message);
    return fallbackResponses[riskLevel];
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
