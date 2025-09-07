import { api } from "encore.dev/api";
import { supabase } from "./client";
import { chatDB } from "../chat/db";
import { authDB } from "../auth/db";

export interface SyncDataRequest {
  userId: string;
  syncType: "chat" | "mood" | "profile" | "all";
}

export interface SyncDataResponse {
  success: boolean;
  syncedRecords: number;
  message: string;
}

// Syncs data between Encore.ts database and Supabase
export const syncData = api<SyncDataRequest, SyncDataResponse>(
  { expose: true, method: "POST", path: "/supabase/sync" },
  async (req) => {
    const { userId, syncType } = req;
    let syncedRecords = 0;

    try {
      if (syncType === "all" || syncType === "profile") {
        // Sync user profile data
        const userProfile = await authDB.queryRow<{
          id: string;
          email: string | null;
          username: string | null;
          role: string;
          is_anonymous: boolean;
          created_at: string;
        }>`
          SELECT id, email, username, role, is_anonymous, created_at
          FROM users
          WHERE id = ${userId}
        `;

        if (userProfile) {
          const { error } = await supabase
            .from('users')
            .upsert({
              id: userProfile.id,
              email: userProfile.email,
              username: userProfile.username,
              role: userProfile.role,
              is_anonymous: userProfile.is_anonymous,
              created_at: userProfile.created_at,
              updated_at: new Date().toISOString(),
            });

          if (!error) syncedRecords++;
        }
      }

      if (syncType === "all" || syncType === "chat") {
        // Sync chat sessions
        const chatSessions = await chatDB.queryAll<{
          id: string;
          user_id: string;
          session_type: string;
          language: string;
          is_anonymous: boolean;
          created_at: string;
        }>`
          SELECT id, user_id, session_type, language, is_anonymous, created_at
          FROM chat_sessions
          WHERE user_id = ${userId}
        `;

        for (const session of chatSessions) {
          const { error } = await supabase
            .from('chat_sessions')
            .upsert({
              id: session.id,
              user_id: session.user_id,
              session_type: session.session_type,
              language: session.language,
              is_anonymous: session.is_anonymous,
              created_at: session.created_at,
              updated_at: new Date().toISOString(),
            });

          if (!error) syncedRecords++;
        }

        // Sync chat messages for user's sessions
        const chatMessages = await chatDB.queryAll<{
          id: string;
          session_id: string;
          sender: string;
          message: string;
          sentiment_score: number | null;
          risk_level: string;
          timestamp: string;
        }>`
          SELECT cm.id, cm.session_id, cm.sender, cm.message, cm.sentiment_score, cm.risk_level, cm.timestamp
          FROM chat_messages cm
          JOIN chat_sessions cs ON cm.session_id = cs.id
          WHERE cs.user_id = ${userId}
        `;

        for (const message of chatMessages) {
          const { error } = await supabase
            .from('chat_messages')
            .upsert({
              id: message.id,
              session_id: message.session_id,
              sender: message.sender,
              message: message.message,
              sentiment_score: message.sentiment_score,
              risk_level: message.risk_level,
              timestamp: message.timestamp,
            });

          if (!error) syncedRecords++;
        }
      }

      if (syncType === "all" || syncType === "mood") {
        // Sync mood logs
        const moodLogs = await chatDB.queryAll<{
          id: string;
          user_id: string;
          mood_score: number;
          notes: string | null;
          date: string;
          created_at: string;
        }>`
          SELECT id, user_id, mood_score, notes, date, created_at
          FROM mood_logs
          WHERE user_id = ${userId}
        `;

        for (const mood of moodLogs) {
          const { error } = await supabase
            .from('mood_logs')
            .upsert({
              id: mood.id,
              user_id: mood.user_id,
              mood_score: mood.mood_score,
              notes: mood.notes,
              date: mood.date,
              created_at: mood.created_at,
            });

          if (!error) syncedRecords++;
        }
      }

      return {
        success: true,
        syncedRecords,
        message: `Successfully synced ${syncedRecords} records to Supabase`,
      };
    } catch (error) {
      console.error("Error syncing data to Supabase:", error);
      return {
        success: false,
        syncedRecords,
        message: "Failed to sync data to Supabase",
      };
    }
  }
);
