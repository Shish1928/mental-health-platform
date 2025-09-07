import { api, APIError } from "encore.dev/api";
import { chatDB } from "./db";

export interface LogMoodRequest {
  userId: string;
  moodScore: number;
  notes?: string;
  date?: string;
}

export interface LogMoodResponse {
  success: boolean;
  message: string;
}

// Logs user's mood for the day
export const logMood = api<LogMoodRequest, LogMoodResponse>(
  { expose: true, method: "POST", path: "/chat/mood" },
  async (req) => {
    const { userId, moodScore, notes, date } = req;

    if (moodScore < 1 || moodScore > 5) {
      throw APIError.invalidArgument("Mood score must be between 1 and 5");
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    // Check if mood already logged for this date
    const existing = await chatDB.queryRow<{ id: string }>`
      SELECT id FROM mood_logs
      WHERE user_id = ${userId} AND date = ${logDate}
    `;

    if (existing) {
      // Update existing mood log
      await chatDB.exec`
        UPDATE mood_logs
        SET mood_score = ${moodScore}, notes = ${notes}, created_at = NOW()
        WHERE user_id = ${userId} AND date = ${logDate}
      `;
    } else {
      // Create new mood log
      await chatDB.exec`
        INSERT INTO mood_logs (user_id, mood_score, notes, date)
        VALUES (${userId}, ${moodScore}, ${notes}, ${logDate})
      `;
    }

    return {
      success: true,
      message: "Mood logged successfully",
    };
  }
);
