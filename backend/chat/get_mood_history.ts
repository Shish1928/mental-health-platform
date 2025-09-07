import { api } from "encore.dev/api";
import { chatDB } from "./db";

export interface GetMoodHistoryRequest {
  userId: string;
  days?: number;
}

export interface MoodEntry {
  date: string;
  moodScore: number;
  notes?: string;
}

export interface GetMoodHistoryResponse {
  moodHistory: MoodEntry[];
  averageMood: number;
}

// Gets user's mood history
export const getMoodHistory = api<GetMoodHistoryRequest, GetMoodHistoryResponse>(
  { expose: true, method: "GET", path: "/chat/mood/:userId" },
  async (req) => {
    const { userId, days = 30 } = req;

    const moodLogs = await chatDB.queryAll<{
      date: string;
      mood_score: number;
      notes: string | null;
    }>`
      SELECT date, mood_score, notes
      FROM mood_logs
      WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY date DESC
    `;

    const moodHistory = moodLogs.map(log => ({
      date: log.date,
      moodScore: log.mood_score,
      notes: log.notes || undefined,
    }));

    const averageMood = moodHistory.length > 0
      ? moodHistory.reduce((sum, entry) => sum + entry.moodScore, 0) / moodHistory.length
      : 0;

    return {
      moodHistory,
      averageMood: Math.round(averageMood * 100) / 100,
    };
  }
);
