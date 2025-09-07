import { api } from "encore.dev/api";
import { mediaDB } from "./db";

export interface UpdateProgressRequest {
  userId: string;
  mediaId: string;
  progressSeconds: number;
  completed?: boolean;
}

export interface UpdateProgressResponse {
  success: boolean;
}

// Updates user's progress for media content
export const updateProgress = api<UpdateProgressRequest, UpdateProgressResponse>(
  { expose: true, method: "POST", path: "/media/progress" },
  async (req) => {
    const { userId, mediaId, progressSeconds, completed = false } = req;

    await mediaDB.exec`
      INSERT INTO user_media_progress (user_id, media_id, progress_seconds, completed, last_accessed)
      VALUES (${userId}, ${mediaId}, ${progressSeconds}, ${completed}, NOW())
      ON CONFLICT (user_id, media_id)
      DO UPDATE SET
        progress_seconds = ${progressSeconds},
        completed = ${completed},
        last_accessed = NOW()
    `;

    return { success: true };
  }
);
