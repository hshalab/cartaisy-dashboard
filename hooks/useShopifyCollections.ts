'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth';
import { ShopifyCollection } from '@/types';

export interface UseShopifyCollectionsReturn {
  collections: ShopifyCollection[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useShopifyCollections(): UseShopifyCollectionsReturn {
  const { status: sessionStatus } = useSession();
  const [collections, setCollections] = useState<ShopifyCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/shopify/collections');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch collections');
      }

      setCollections(data.data?.collections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchCollections();
    } else if (sessionStatus === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [sessionStatus, fetchCollections]);

  return {
    collections,
    isLoading,
    error,
    refetch: fetchCollections,
  };
}
