import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Get the current user's session and storeId
 * Returns null if not authenticated
 */
export async function getCurrentUserStoreId() {
  try {
    const session = await getServerSession(authConfig);
    return session?.user?.storeId || null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
}

/**
 * API response helper for successful responses
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * API response helper for error responses
 */
export function errorResponse(
  error: string,
  message?: string,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Middleware wrapper to protect API routes
 * Returns 401 if not authenticated
 * Provides storeId to the handler
 */
export async function withAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    storeId: string
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const storeId = await getCurrentUserStoreId();

    if (!storeId) {
      return errorResponse('Unauthorized', 'Authentication required', 401);
    }

    return await handler(request, storeId);
  } catch (error) {
    console.error('API error:', error);
    return errorResponse(
      'Internal server error',
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}
