/**
 * Server-side auth utilities for API routes
 *
 * This module provides authentication helpers for Next.js API routes
 * that work with the new JWT-based auth system.
 */

import { headers, cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://cartaisy-backend-production.up.railway.app/api/v1';

/**
 * Session user data structure (matches NextAuth's format for compatibility)
 */
export interface ServerSessionUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  storeId?: string;
  storeName?: string;
}

/**
 * Server session structure (matches NextAuth's format for compatibility)
 */
export interface ServerSession {
  user: ServerSessionUser;
  expires: string;
}

/**
 * Get the authorization token from request headers
 */
export async function getAuthToken(request?: NextRequest): Promise<string | null> {
  // Try to get from request headers if provided
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      console.log('[getAuthToken] Found token in request headers');
      return authHeader.slice(7);
    }
  }

  // Try to get from cookies (for browser requests)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('cartaisy_token')?.value;
    console.log('[getAuthToken] Cookie token:', token ? 'EXISTS' : 'MISSING');
    if (token) return token;
  } catch (error) {
    console.error('[getAuthToken] Cookie read error:', error);
  }

  return null;
}

/**
 * Verify token and get user info from backend
 * This replaces NextAuth's getServerSession()
 */
export async function getServerSession(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _authConfig?: unknown, // Accept authConfig for backward compatibility but ignore it
  request?: NextRequest
): Promise<ServerSession | null> {
  const token = await getAuthToken(request);

  if (!token) {
    return null;
  }

  try {
    // Verify token by calling the profile endpoint
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 'success' || !data.data?.user) {
      return null;
    }

    const user = data.data.user;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || user.name,
        role: user.role,
        storeId: user.storeId,
        storeName: user.storeName,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Server session verification failed:', error);
    return null;
  }
}

/**
 * Backward-compatible authConfig export
 * This is a placeholder that allows existing code to import authConfig
 * without breaking, even though we're not using NextAuth anymore.
 */
export const authConfig = {
  // Empty config - just for backward compatibility
  // The actual auth is now handled by getServerSession above
};
