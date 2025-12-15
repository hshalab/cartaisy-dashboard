import { ShopifyStatus, ShopifyCollection } from '@/types';

/**
 * Get Shopify connection status from the dashboard API
 * Auth is handled via NextAuth session cookies
 */
export async function getConnectionStatus(): Promise<ShopifyStatus> {
  const response = await fetch(`/api/shopify/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Shopify status');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Initiate OAuth flow with Shopify
 * Auth is handled via NextAuth session cookies
 */
export async function initiateOAuth(shop: string): Promise<{ authorizationUrl: string }> {
  // Normalize shop name
  const normalizedShop = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  const response = await fetch(`/api/shopify/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ shop: normalizedShop }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate OAuth');
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Disconnect Shopify store
 * Auth is handled via NextAuth session cookies
 */
export async function disconnect(): Promise<void> {
  const response = await fetch(`/api/shopify/disconnect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect Shopify');
  }
}

/**
 * Get collections from connected Shopify store
 * Auth is handled via NextAuth session cookies
 */
export async function getCollections(): Promise<ShopifyCollection[]> {
  const response = await fetch(`/api/shopify/collections`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }

  const data = await response.json();
  return data.data || [];
}
