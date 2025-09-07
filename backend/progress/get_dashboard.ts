import { api } from "encore.dev/api";
import { progressDB } from "./db";

export interface GetDashboardRequest {
  userId: string;
}

export interface DashboardStats {
  totalPoints: number;
  currentStreaks: { activityType: string; streak: number }[];
  recentAchievements: { name: string; description: string; earnedAt: string }[];
  weeklyProgress: { date: string; totalMinutes: number; points: number }[];
  topActivities: { activityType: string; totalMinutes: number; sessions: number }[];
}

export interface GetDashboardResponse {
  dashboard: DashboardStats;
}

// Gets user's progress dashboard
export const getDashboard = api<GetDashboardRequest, GetDashboardResponse>(
  { expose: true, method: "GET", path: "/progress/dashboard/:userId" },
  async (req) => {
    const { userId } = req;

    // Get total points
    const pointsResult = await progressDB.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(points_earned), 0) as total
      FROM user_progress
      WHERE user_id = ${userId}
    `;

    // Get current streaks
    const streaks = await progressDB.queryAll<{
      activity_type: string;
      current_streak: number;
    }>`
      SELECT activity_type, current_streak
      FROM user_streaks
      WHERE user_id = ${userId} AND current_streak > 0
      ORDER BY current_streak DESC
    `;

    // Get recent achievements
    const achievements = await progressDB.queryAll<{
      achievement_name: string;
      description: string;
      earned_at: string;
    }>`
      SELECT achievement_name, description, earned_at
      FROM user_achievements
      WHERE user_id = ${userId}
      ORDER BY earned_at DESC
      LIMIT 5
    `;

    // Get weekly progress
    const weeklyProgress = await progressDB.queryAll<{
      date: string;
      total_minutes: number;
      total_points: number;
    }>`
      SELECT date, 
             COALESCE(SUM(duration_minutes), 0) as total_minutes,
             COALESCE(SUM(points_earned), 0) as total_points
      FROM user_progress
      WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date DESC
    `;

    // Get top activities
    const topActivities = await progressDB.queryAll<{
      activity_type: string;
      total_minutes: number;
      session_count: number;
    }>`
      SELECT activity_type,
             COALESCE(SUM(duration_minutes), 0) as total_minutes,
             COUNT(*) as session_count
      FROM user_progress
      WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY activity_type
      ORDER BY total_minutes DESC
      LIMIT 5
    `;

    return {
      dashboard: {
        totalPoints: pointsResult?.total || 0,
        currentStreaks: streaks.map(s => ({
          activityType: s.activity_type,
          streak: s.current_streak,
        })),
        recentAchievements: achievements.map(a => ({
          name: a.achievement_name,
          description: a.description,
          earnedAt: a.earned_at,
        })),
        weeklyProgress: weeklyProgress.map(w => ({
          date: w.date,
          totalMinutes: w.total_minutes,
          points: w.total_points,
        })),
        topActivities: topActivities.map(a => ({
          activityType: a.activity_type,
          totalMinutes: a.total_minutes,
          sessions: a.session_count,
        })),
      },
    };
  }
);
