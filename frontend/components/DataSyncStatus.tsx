import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  CloudUpload, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import backend from '~backend/client';

interface DataSyncStatusProps {
  userId: string;
}

export default function DataSyncStatus({ userId }: DataSyncStatusProps) {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const syncDataMutation = useMutation({
    mutationFn: (syncType: 'chat' | 'mood' | 'profile' | 'all') =>
      backend.supabase.syncData({
        userId,
        syncType,
      }),
    onSuccess: (data) => {
      setSyncStatus('success');
      setLastSync(new Date());
      toast({
        title: 'Data synced successfully',
        description: `${data.syncedRecords} records synced to cloud storage.`,
      });
    },
    onError: (error) => {
      setSyncStatus('error');
      console.error('Sync error:', error);
      toast({
        title: 'Sync failed',
        description: 'Failed to sync data to cloud storage. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSync = (syncType: 'chat' | 'mood' | 'profile' | 'all' = 'all') => {
    setSyncStatus('syncing');
    syncDataMutation.mutate(syncType);
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Database className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      default:
        return 'Ready to sync';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CloudUpload className="w-4 h-4" />
            <span>Data Sync</span>
          </div>
          <Badge variant="outline" className={`text-white ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {lastSync && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Last sync: {lastSync.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSync('all')}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            Sync All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSync('chat')}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSync('mood')}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            Mood
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSync('profile')}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            Profile
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Your data is automatically backed up to secure cloud storage for safety and analytics.
        </p>
      </CardContent>
    </Card>
  );
}
