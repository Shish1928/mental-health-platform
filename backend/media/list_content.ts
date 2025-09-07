import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { mediaDB } from "./db";

export interface ListContentRequest {
  category?: Query<string>;
  language?: Query<string>;
  contentType?: Query<string>;
  difficulty?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

export interface MediaContent {
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
}

export interface ListContentResponse {
  content: MediaContent[];
  total: number;
}

// Lists media content with filtering options
export const listContent = api<ListContentRequest, ListContentResponse>(
  { expose: true, method: "GET", path: "/media/content" },
  async (req) => {
    const { category, language = "en", contentType, difficulty, limit = 20, offset = 0 } = req;

    let whereClause = `WHERE language = ${language}`;
    const params: any[] = [];

    if (category) {
      whereClause += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (contentType) {
      whereClause += ` AND content_type = $${params.length + 1}`;
      params.push(contentType);
    }

    if (difficulty) {
      whereClause += ` AND difficulty_level = $${params.length + 1}`;
      params.push(difficulty);
    }

    const query = `
      SELECT id, title, description, content_type, category, url, thumbnail_url,
             duration_minutes, language, difficulty_level, tags, is_premium, is_downloadable
      FROM media_content
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const content = await mediaDB.rawQueryAll<{
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
    }>(query, ...params);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM media_content
      ${whereClause}
    `;

    const countResult = await mediaDB.rawQueryRow<{ total: number }>(
      countQuery,
      ...params.slice(0, -2)
    );

    return {
      content: content.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        contentType: item.content_type,
        category: item.category,
        url: item.url,
        thumbnailUrl: item.thumbnail_url || undefined,
        durationMinutes: item.duration_minutes || undefined,
        language: item.language,
        difficultyLevel: item.difficulty_level,
        tags: item.tags || [],
        isPremium: item.is_premium,
        isDownloadable: item.is_downloadable,
      })),
      total: countResult?.total || 0,
    };
  }
);
