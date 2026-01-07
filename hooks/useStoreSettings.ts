'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/lib/auth';
import { customInstance } from '@/lib/api/mutator/custom-instance';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cartaisy-backend-production.up.railway.app/api/v1';

export interface StoreSettings {
  currency: string;
  timezone: string;
  language: string;
}

export interface SyncFromShopifyResponse {
  success: boolean;
  data: {
    currency: string;
    timezone: string;
    language: string;
  };
  message: string;
}

export interface UseSyncFromShopifyReturn {
  syncFromShopify: () => Promise<SyncFromShopifyResponse | null>;
  isPending: boolean;
  error: string | null;
}

/**
 * Hook to sync store settings from Shopify
 * Calls POST /api/v1/admin/stores/{storeId}/settings/sync-from-shopify
 */
export function useSyncFromShopify(storeId?: string): UseSyncFromShopifyReturn {
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStoreId = storeId || session?.user?.storeId;

  const syncFromShopify = useCallback(async (): Promise<SyncFromShopifyResponse | null> => {
    if (!effectiveStoreId) {
      setError('No store ID available');
      return null;
    }

    try {
      setIsPending(true);
      setError(null);

      const response = await customInstance<{
        data: SyncFromShopifyResponse & { error?: string };
        status: number;
      }>(`${API_URL}/admin/stores/${effectiveStoreId}/settings/sync-from-shopify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 && response.data?.success) {
        return response.data;
      } else {
        // Extract error message from API response (handles 400 and other error statuses)
        const errorMsg = response.data?.error || response.data?.message || 'Failed to sync from Shopify';
        throw new Error(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync from Shopify';
      setError(errorMessage);
      return null;
    } finally {
      setIsPending(false);
    }
  }, [effectiveStoreId]);

  return {
    syncFromShopify,
    isPending,
    error,
  };
}
