import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { appointmentsDB } from "./db";

export interface ListCounselorsRequest {
  specialization?: Query<string>;
  language?: Query<string>;
  available?: Query<boolean>;
}

export interface Counselor {
  id: string;
  userId: string;
  specializations: string[];
  languages: string[];
  bio?: string;
  experienceYears: number;
  rating: number;
  totalSessions: number;
  isAvailable: boolean;
}

export interface ListCounselorsResponse {
  counselors: Counselor[];
}

// Lists available counselors with filtering options
export const listCounselors = api<ListCounselorsRequest, ListCounselorsResponse>(
  { expose: true, method: "GET", path: "/appointments/counselors" },
  async (req) => {
    const { specialization, language, available = true } = req;

    let whereClause = `WHERE is_available = ${available}`;
    const params: any[] = [];

    if (specialization) {
      whereClause += ` AND $${params.length + 1} = ANY(specializations)`;
      params.push(specialization);
    }

    if (language) {
      whereClause += ` AND $${params.length + 1} = ANY(languages)`;
      params.push(language);
    }

    const query = `
      SELECT id, user_id, specializations, languages, bio, experience_years,
             rating, total_sessions, is_available
      FROM counselors
      ${whereClause}
      ORDER BY rating DESC, total_sessions DESC
    `;

    const counselors = await appointmentsDB.rawQueryAll<{
      id: string;
      user_id: string;
      specializations: string[] | null;
      languages: string[] | null;
      bio: string | null;
      experience_years: number;
      rating: number;
      total_sessions: number;
      is_available: boolean;
    }>(query, ...params);

    return {
      counselors: counselors.map(counselor => ({
        id: counselor.id,
        userId: counselor.user_id,
        specializations: counselor.specializations || [],
        languages: counselor.languages || [],
        bio: counselor.bio || undefined,
        experienceYears: counselor.experience_years,
        rating: counselor.rating,
        totalSessions: counselor.total_sessions,
        isAvailable: counselor.is_available,
      })),
    };
  }
);
