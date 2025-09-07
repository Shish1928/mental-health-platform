import { api } from "encore.dev/api";
import { progressDB } from "./db";

export interface TrackActivityRequest {
  userId: string;
  activityType: string;
  activityId?: string;
  durationMinutes?: number;
  pointsEarned?: number;
}

export interface TrackActivityResponse {
  success: boolean;
  pointsEarned: number;
  streakUpdated: boolean;
  newAchievements: string[];
}

// Tracks user activity and updates progress
export const trackActivity = api<TrackActivityRequest, TrackActivityResponse>(
  { expose: true, method: "POST", path: "/progress/track" },
  async (req) => {
    const { userId, activityType, activityId, durationMinutes = 0, pointsEarned = 0 } = req;

    const today = new Date().toISOString().split('T')[0];

    // Record the activity
    await progressDB.exec`
      INSERT INTO user_progress (user_id, activity_type, activity_id, duration_minutes, points_earned, date)
      VALUES (${userId}, ${activityType}, ${activityId}, ${durationMinutes}, ${pointsEarned}, ${today})
    `;

    // Update streak
    const streakUpdated = await updateStreak(userId, activityType, today);

    // Check for new achievements
    const newAchievements = await checkAchievements(userId, activityType);

    return {
      success: true,
      pointsEarned,
      streakUpdated,
      newAchievements,
    };
  }
);

async function updateStreak(userId: string, activityType: string, date: string): Promise<boolean> {
  const existing = await progressDB.queryRow<{
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
  }>`
    SELECT current_streak, longest_streak, last_activity_date
    FROM user_streaks
    WHERE user_id = ${userId} AND activity_type = ${activityType}
  `;

  if (!existing) {
    // First time tracking this activity
    await progressDB.exec`
      INSERT INTO user_streaks (user_id, activity_type, current_streak, longest_streak, last_activity_date)
      VALUES (${userId}, ${activityType}, 1, 1, ${date})
    `;
    return true;
  }

  const lastDate = existing.last_activity_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newCurrentStreak = 1;
  if (lastDate === yesterdayStr) {
    // Consecutive day
    newCurrentStreak = existing.current_streak + 1;
  } else if (lastDate === date) {
    // Same day, no streak change
    return false;
  }

  const newLongestStreak = Math.max(existing.longest_streak, newCurrentStreak);

  await progressDB.exec`
    UPDATE user_streaks
    SET current_streak = ${newCurrentStreak},
        longest_streak = ${newLongestStreak},
        last_activity_date = ${date},
        updated_at = NOW()
    WHERE user_id = ${userId} AND activity_type = ${activityType}
  `;

  return true;
}

async function checkAchievements(userId: string, activityType: string): Promise<string[]> {
  const achievements: string[] = [];

  // Get current streak
  const streak = await progressDB.queryRow<{ current_streak: number }>`
    SELECT current_streak
    FROM user_streaks
    WHERE user_id = ${userId} AND activity_type = ${activityType}
  `;

  if (streak) {
    const milestones = [7, 30, 60, 100];
    for (const milestone of milestones) {
      if (streak.current_streak >= milestone) {
        const achievementName = `${milestone}-day-${activityType}-streak`;
        
        // Check if already earned
        const existing = await progressDB.queryRow<{ id: string }>`
          SELECT id FROM user_achievements
          WHERE user_id = ${userId} AND achievement_name = ${achievementName}
        `;

        if (!existing) {
          await progressDB.exec`
            INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, points_value)
            VALUES (${userId}, 'streak', ${achievementName}, 
                   ${`Completed ${milestone} consecutive days of ${activityType}`}, ${milestone * 10})
          `;
          achievements.push(achievementName);
        }
      }
    }
  }

  return achievements;
}
