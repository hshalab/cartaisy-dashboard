'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth';
import { StoreStats } from '@/types';

export interface UseStoreStatsReturn {
  stats: StoreStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStoreStats(): UseStoreStatsReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/store/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch store stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store stats');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session?.user?.id]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
