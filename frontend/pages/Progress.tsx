import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target, 
  Smile, 
  Meh, 
  Frown,
  Trophy,
  Flame,
  BarChart3
} from 'lucide-react';
import backend from '~backend/client';

const moodEmojis = {
  1: { icon: Frown, label: 'Very Sad', color: 'text-red-500' },
  2: { icon: Frown, label: 'Sad', color: 'text-orange-500' },
  3: { icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
  4: { icon: Smile, label: 'Good', color: 'text-green-500' },
  5: { icon: Smile, label: 'Great', color: 'text-blue-500' },
};

export default function Progress() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in real app, get from auth context
  const userId = 'current-user-id';

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['progress-dashboard', userId],
    queryFn: () => backend.progress.getDashboard({ userId }),
  });

  const { data: moodHistory } = useQuery({
    queryKey: ['mood-history', userId],
    queryFn: () => backend.chat.getMoodHistory({ userId, days: 30 }),
  });

  const logMoodMutation = useMutation({
    mutationFn: (moodData: { moodScore: number; notes?: string }) =>
      backend.chat.logMood({
        userId,
        moodScore: moodData.moodScore,
        notes: moodData.notes,
      }),
    onSuccess: () => {
      toast({
        title: 'Mood logged successfully',
        description: 'Your mood has been recorded for today.',
      });
      setSelectedMood(null);
      setMoodNotes('');
      queryClient.invalidateQueries({ queryKey: ['mood-history'] });
    },
    onError: (error) => {
      console.error('Error logging mood:', error);
      toast({
        title: 'Error',
        description: 'Failed to log mood. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleMoodSubmit = () => {
    if (selectedMood) {
      logMoodMutation.mutate({
        moodScore: selectedMood,
        notes: moodNotes || undefined,
      });
    }
  };

  const dashboard = dashboardData?.dashboard;

  if (dashboardLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your mental health journey with mood logs, activity streaks, and wellness metrics.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{dashboard?.totalPoints || 0}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard?.currentStreaks?.[0]?.streak || 0}
                </p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {dashboard?.recentAchievements?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {moodHistory?.averageMood?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Logger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Log Today's Mood</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">How are you feeling today?</p>
              <div className="flex space-x-2">
                {Object.entries(moodEmojis).map(([score, mood]) => {
                  const Icon = mood.icon;
                  const isSelected = selectedMood === parseInt(score);
                  return (
                    <Button
                      key={score}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMood(parseInt(score))}
                      className="flex-1 flex-col h-16"
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-foreground' : mood.color}`} />
                      <span className="text-xs">{score}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                placeholder="How are you feeling? What's on your mind?"
                className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleMoodSubmit}
              disabled={!selectedMood || logMoodMutation.isPending}
              className="w-full"
            >
              {logMoodMutation.isPending ? 'Logging...' : 'Log Mood'}
            </Button>
          </CardContent>
        </Card>

        {/* Current Streaks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="w-5 h-5" />
              <span>Current Streaks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard?.currentStreaks && dashboard.currentStreaks.length > 0 ? (
              dashboard.currentStreaks.map((streak, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {streak.activityType}
                    </span>
                    <Badge variant="outline">
                      {streak.streak} days
                    </Badge>
                  </div>
                  <ProgressBar value={(streak.streak / 30) * 100} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start activities to build streaks!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard?.recentAchievements && dashboard.recentAchievements.length > 0 ? (
              dashboard.recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Complete activities to earn achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Mood Trend (30 days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodHistory?.moodHistory && moodHistory.moodHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{moodHistory.averageMood.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Average Mood Score</p>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {moodHistory.moodHistory.slice(0, 10).map((entry, index) => {
                    const mood = moodEmojis[entry.moodScore as keyof typeof moodEmojis];
                    const Icon = mood.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${mood.color}`} />
                          <span className="text-sm">{mood.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{entry.moodScore}/5</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start logging your mood to see trends!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
