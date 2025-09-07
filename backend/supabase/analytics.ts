import { api } from "encore.dev/api";
import { supabase } from "./client";
import { Query } from "encore.dev/api";

export interface GetAnalyticsRequest {
  timeframe?: Query<string>; // "7d", "30d", "90d"
  metric?: Query<string>; // "users", "sessions", "mood", "risk"
}

export interface AnalyticsData {
  totalUsers: number;
  totalSessions: number;
  averageMoodScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  dailyActiveUsers: { date: string; count: number }[];
  moodTrends: { date: string; averageMood: number }[];
}

export interface GetAnalyticsResponse {
  analytics: AnalyticsData;
}

// Gets analytics data from Supabase for mental health insights
export const getAnalytics = api<GetAnalyticsRequest, GetAnalyticsResponse>(
  { expose: true, method: "GET", path: "/supabase/analytics" },
  async (req) => {
    const { timeframe = "30d", metric = "all" } = req;

    try {
      const days = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get average mood score
      const { data: moodData } = await supabase
        .from('mood_logs')
        .select('mood_score')
        .gte('created_at', startDate.toISOString());

      const averageMoodScore = moodData && moodData.length > 0
        ? moodData.reduce((sum, log) => sum + log.mood_score, 0) / moodData.length
        : 0;

      // Get risk distribution
      const { data: riskData } = await supabase
        .from('chat_messages')
        .select('risk_level')
        .gte('timestamp', startDate.toISOString());

      const riskDistribution = {
        low: riskData?.filter(m => m.risk_level === 'low').length || 0,
        medium: riskData?.filter(m => m.risk_level === 'medium').length || 0,
        high: riskData?.filter(m => m.risk_level === 'high').length || 0,
      };

      // Get daily active users
      const { data: dailyUsers } = await supabase
        .rpc('get_daily_active_users', { 
          start_date: startDate.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });

      // Get mood trends
      const { data: moodTrends } = await supabase
        .rpc('get_mood_trends', {
          start_date: startDate.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        });

      return {
        analytics: {
          totalUsers: totalUsers || 0,
          totalSessions: totalSessions || 0,
          averageMoodScore: Math.round(averageMoodScore * 100) / 100,
          riskDistribution,
          dailyActiveUsers: dailyUsers || [],
          moodTrends: moodTrends || [],
        },
      };
    } catch (error) {
      console.error("Error fetching analytics from Supabase:", error);
      
      // Return default analytics data if error
      return {
        analytics: {
          totalUsers: 0,
          totalSessions: 0,
          averageMoodScore: 0,
          riskDistribution: { low: 0, medium: 0, high: 0 },
          dailyActiveUsers: [],
          moodTrends: [],
        },
      };
    }
  }
);
