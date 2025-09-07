import { api } from "encore.dev/api";
import { supabase } from "./client";
import { chatDB } from "../chat/db";
import { authDB } from "../auth/db";
import { mediaDB } from "../media/db";
import { appointmentsDB } from "../appointments/db";
import { progressDB } from "../progress/db";

export interface BackupDataRequest {
  backupType: "full" | "incremental";
  tablesToBackup?: string[];
}

export interface BackupDataResponse {
  success: boolean;
  backupId: string;
  recordsBackedUp: number;
  message: string;
}

// Creates a backup of all data to Supabase
export const backupData = api<BackupDataRequest, BackupDataResponse>(
  { expose: true, method: "POST", path: "/supabase/backup" },
  async (req) => {
    const { backupType, tablesToBackup = ["all"] } = req;
    const backupId = `backup_${Date.now()}`;
    let recordsBackedUp = 0;

    try {
      // Create backup record
      const { error: backupError } = await supabase
        .from('backups')
        .insert({
          id: backupId,
          backup_type: backupType,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        });

      if (backupError) {
        throw new Error(`Failed to create backup record: ${backupError.message}`);
      }

      const shouldBackup = (table: string) => 
        tablesToBackup.includes("all") || tablesToBackup.includes(table);

      // Backup users and profiles
      if (shouldBackup("users")) {
        const users = await authDB.queryAll<any>`SELECT * FROM users`;
        const profiles = await authDB.queryAll<any>`SELECT * FROM user_profiles`;

        for (const user of users) {
          await supabase.from('users').upsert(user);
          recordsBackedUp++;
        }

        for (const profile of profiles) {
          await supabase.from('user_profiles').upsert(profile);
          recordsBackedUp++;
        }
      }

      // Backup chat data
      if (shouldBackup("chat")) {
        const sessions = await chatDB.queryAll<any>`SELECT * FROM chat_sessions`;
        const messages = await chatDB.queryAll<any>`SELECT * FROM chat_messages`;
        const moods = await chatDB.queryAll<any>`SELECT * FROM mood_logs`;

        for (const session of sessions) {
          await supabase.from('chat_sessions').upsert(session);
          recordsBackedUp++;
        }

        for (const message of messages) {
          await supabase.from('chat_messages').upsert(message);
          recordsBackedUp++;
        }

        for (const mood of moods) {
          await supabase.from('mood_logs').upsert(mood);
          recordsBackedUp++;
        }
      }

      // Backup media data
      if (shouldBackup("media")) {
        const mediaContent = await mediaDB.queryAll<any>`SELECT * FROM media_content`;
        const mediaProgress = await mediaDB.queryAll<any>`SELECT * FROM user_media_progress`;
        const mediaFavorites = await mediaDB.queryAll<any>`SELECT * FROM user_media_favorites`;

        for (const content of mediaContent) {
          await supabase.from('media_content').upsert(content);
          recordsBackedUp++;
        }

        for (const progress of mediaProgress) {
          await supabase.from('user_media_progress').upsert(progress);
          recordsBackedUp++;
        }

        for (const favorite of mediaFavorites) {
          await supabase.from('user_media_favorites').upsert(favorite);
          recordsBackedUp++;
        }
      }

      // Backup appointments data
      if (shouldBackup("appointments")) {
        const counselors = await appointmentsDB.queryAll<any>`SELECT * FROM counselors`;
        const appointments = await appointmentsDB.queryAll<any>`SELECT * FROM appointments`;
        const sessionNotes = await appointmentsDB.queryAll<any>`SELECT * FROM session_notes`;

        for (const counselor of counselors) {
          await supabase.from('counselors').upsert(counselor);
          recordsBackedUp++;
        }

        for (const appointment of appointments) {
          await supabase.from('appointments').upsert(appointment);
          recordsBackedUp++;
        }

        for (const note of sessionNotes) {
          await supabase.from('session_notes').upsert(note);
          recordsBackedUp++;
        }
      }

      // Backup progress data
      if (shouldBackup("progress")) {
        const userProgress = await progressDB.queryAll<any>`SELECT * FROM user_progress`;
        const userStreaks = await progressDB.queryAll<any>`SELECT * FROM user_streaks`;
        const userAchievements = await progressDB.queryAll<any>`SELECT * FROM user_achievements`;

        for (const progress of userProgress) {
          await supabase.from('user_progress').upsert(progress);
          recordsBackedUp++;
        }

        for (const streak of userStreaks) {
          await supabase.from('user_streaks').upsert(streak);
          recordsBackedUp++;
        }

        for (const achievement of userAchievements) {
          await supabase.from('user_achievements').upsert(achievement);
          recordsBackedUp++;
        }
      }

      // Update backup record
      await supabase
        .from('backups')
        .update({
          status: 'completed',
          records_backed_up: recordsBackedUp,
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupId);

      return {
        success: true,
        backupId,
        recordsBackedUp,
        message: `Successfully backed up ${recordsBackedUp} records to Supabase`,
      };
    } catch (error) {
      console.error("Error during backup:", error);

      // Update backup record with error
      await supabase
        .from('backups')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', backupId);

      return {
        success: false,
        backupId,
        recordsBackedUp,
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
);
