import { api } from "encore.dev/api";
import { voiceDB } from "./db";
import { secret } from "encore.dev/config";

const geminiAPIKey = secret("GeminiAPIKey");

export interface ProcessAudioRequest {
  sessionId: string;
  audioData: string; // Base64 encoded audio
  language?: string;
}

export interface ProcessAudioResponse {
  transcript: string;
  aiResponse: string;
  sentimentScore?: number;
  riskLevel: "low" | "medium" | "high";
  processingTimeMs: number;
}

// Processes audio input and returns transcript and AI response
export const processAudio = api<ProcessAudioRequest, ProcessAudioResponse>(
  { expose: true, method: "POST", path: "/voice/process" },
  async (req) => {
    const startTime = Date.now();
    const { sessionId, audioData, language = "en" } = req;

    try {
      // Step 1: Convert speech to text (mock implementation)
      const transcript = await speechToText(audioData, language);

      // Step 2: Analyze sentiment and risk
      const sentimentScore = await analyzeSentiment(transcript);
      const riskLevel = calculateRiskLevel(sentimentScore, transcript);

      // Step 3: Generate AI response using Gemini
      const aiResponse = await generateAIResponse(transcript, language, sessionId);

      // Step 4: Store interaction
      const processingTime = Date.now() - startTime;
      await voiceDB.exec`
        INSERT INTO voice_interactions (session_id, audio_transcript, ai_response, sentiment_score, risk_level, processing_time_ms)
        VALUES (${sessionId}, ${transcript}, ${aiResponse}, ${sentimentScore}, ${riskLevel}, ${processingTime})
      `;

      return {
        transcript,
        aiResponse,
        sentimentScore,
        riskLevel,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      throw new Error("Failed to process audio");
    }
  }
);

async function speechToText(audioData: string, language: string): Promise<string> {
  // In a real implementation, this would use Google Speech-to-Text or similar service
  // For now, return a mock transcript based on the session
  const mockTranscripts = [
    "Hello, I've been feeling a bit anxious lately and could use some support.",
    "I'm having trouble sleeping and my mind keeps racing at night.",
    "I feel overwhelmed with my studies and don't know how to manage my stress.",
    "Can you help me with some breathing exercises or relaxation techniques?",
    "I've been feeling isolated and would like someone to talk to.",
    "I'm worried about my upcoming exams and feel like I'm not prepared enough.",
    "Sometimes I feel like I'm not good enough and doubt myself a lot.",
    "I've been having panic attacks and don't know how to cope with them.",
  ];

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
}

async function analyzeSentiment(text: string): Promise<number> {
  const negativeWords = ["anxious", "worried", "stressed", "overwhelmed", "panic", "scared", "sad", "depressed", "hopeless"];
  const positiveWords = ["good", "great", "happy", "confident", "calm", "peaceful", "better", "hopeful"];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.3;
  });
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.3;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function calculateRiskLevel(sentimentScore: number, text: string): "low" | "medium" | "high" {
  const highRiskKeywords = ["suicide", "kill myself", "end it all", "want to die", "hurt myself"];
  const mediumRiskKeywords = ["panic attack", "can't cope", "overwhelmed", "hopeless", "can't handle"];
  
  const lowerText = text.toLowerCase();
  
  if (highRiskKeywords.some(keyword => lowerText.includes(keyword))) {
    return "high";
  }
  
  if (mediumRiskKeywords.some(keyword => lowerText.includes(keyword)) || sentimentScore < -0.5) {
    return "medium";
  }
  
  return "low";
}

async function generateAIResponse(transcript: string, language: string, sessionId: string): Promise<string> {
  try {
    // Get recent conversation history
    const recentInteractions = await voiceDB.queryAll<{ audio_transcript: string; ai_response: string }>`
      SELECT audio_transcript, ai_response
      FROM voice_interactions
      WHERE session_id = ${sessionId}
      ORDER BY timestamp DESC
      LIMIT 5
    `;

    const conversationHistory = recentInteractions
      .reverse()
      .map(interaction => `Human: ${interaction.audio_transcript}\nAssistant: ${interaction.ai_response}`)
      .join('\n\n');

    const prompt = `You are a compassionate AI mental health support assistant specialized in helping students. You provide empathetic, supportive responses using evidence-based therapeutic techniques like CBT and mindfulness. Be warm, understanding, and encouraging. Ask open-ended questions to help users explore their feelings. Always remind users that you're not a replacement for professional help when appropriate.

Key guidelines:
- Be empathetic and non-judgmental
- Use active listening techniques
- Offer practical coping strategies
- Validate the user's feelings
- Encourage professional help when needed
- Keep responses concise but meaningful (2-3 sentences max for voice)

Language: ${language}
Previous conversation:
${conversationHistory}

Current user message: ${transcript}

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
          maxOutputTokens: 200,
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
    
    // Fallback responses based on sentiment
    const fallbackResponses = {
      high: "I can hear that you're going through a really difficult time right now. Your feelings are valid, and I want you to know that you're not alone. Have you considered reaching out to a counselor or trusted friend for additional support?",
      medium: "It sounds like you're dealing with some challenging feelings. Thank you for sharing this with me - that takes courage. What do you think might help you feel a little more supported right now?",
      low: "I appreciate you sharing your thoughts with me. It's important to check in with ourselves regularly. What's one small thing that usually helps you feel a bit better when you're going through tough times?"
    };
    
    const riskLevel = calculateRiskLevel(await analyzeSentiment(transcript), transcript);
    return fallbackResponses[riskLevel];
  }
}
