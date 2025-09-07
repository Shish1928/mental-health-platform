import { api, APIError } from "encore.dev/api";
import { mediaDB } from "./db";

export interface GetContentRequest {
  id: string;
  userId?: string;
}

export interface GetContentResponse {
  content: {
    id: string;
    title: string;
    description?: string;
    contentType: string;
    category: string;
    url: string;
    thumbnailUrl?: string;
    durationMinutes?: number;
    language: string;
    difficultyLevel: string;
    tags: string[];
    isPremium: boolean;
    isDownloadable: boolean;
  };
  userProgress?: {
    progressSeconds: number;
    completed: boolean;
    isFavorite: boolean;
  };
}

// Gets specific media content with user progress
export const getContent = api<GetContentRequest, GetContentResponse>(
  { expose: true, method: "GET", path: "/media/content/:id" },
  async (req) => {
    const { id, userId } = req;

    const content = await mediaDB.queryRow<{
      id: string;
      title: string;
      description: string | null;
      content_type: string;
      category: string;
      url: string;
      thumbnail_url: string | null;
      duration_minutes: number | null;
      language: string;
      difficulty_level: string;
      tags: string[] | null;
      is_premium: boolean;
      is_downloadable: boolean;
    }>`
      SELECT id, title, description, content_type, category, url, thumbnail_url,
             duration_minutes, language, difficulty_level, tags, is_premium, is_downloadable
      FROM media_content
      WHERE id = ${id}
    `;

    if (!content) {
      throw APIError.notFound("Content not found");
    }

    let userProgress;
    if (userId) {
      const progress = await mediaDB.queryRow<{
        progress_seconds: number;
        completed: boolean;
      }>`
        SELECT progress_seconds, completed
        FROM user_media_progress
        WHERE user_id = ${userId} AND media_id = ${id}
      `;

      const favorite = await mediaDB.queryRow<{ id: string }>`
        SELECT id
        FROM user_media_favorites
        WHERE user_id = ${userId} AND media_id = ${id}
      `;

      userProgress = {
        progressSeconds: progress?.progress_seconds || 0,
        completed: progress?.completed || false,
        isFavorite: !!favorite,
      };
    }

    return {
      content: {
        id: content.id,
        title: content.title,
        description: content.description || undefined,
        contentType: content.content_type,
        category: content.category,
        url: content.url,
        thumbnailUrl: content.thumbnail_url || undefined,
        durationMinutes: content.duration_minutes || undefined,
        language: content.language,
        difficultyLevel: content.difficulty_level,
        tags: content.tags || [],
        isPremium: content.is_premium,
        isDownloadable: content.is_downloadable,
      },
      userProgress,
    };
  }
);
