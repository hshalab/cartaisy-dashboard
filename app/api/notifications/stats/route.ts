import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

// Mock data for development/testing until backend endpoints are ready
const MOCK_STATS = {
  totalCustomersWithDevices: 1250,
  totalActiveDevices: 1580,
  platformBreakdown: {
    ios: 920,
    android: 660,
  },
  pushEnabledCustomers: 1180,
  firebaseEnabled: true,
  topic: 'store-notifications',
};

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();
    console.log('[Stats Route] Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');

    const session = await getServerSession(authConfig);
    console.log('[Stats Route] Session:', session ? `user: ${session.user?.id}, storeId: ${session.user?.storeId}` : 'MISSING');

    if (!token || !session?.user?.id) {
      console.log('[Stats Route] Unauthorized - token or session missing');
      return NextResponse.json({ error: 'Unauthorized', debug: { hasToken: !!token, hasSession: !!session } }, { status: 401 });
    }

    // Use storeId if available, otherwise use a default for development
    const storeId = session.user.storeId || 'default';

    // Try to fetch from backend first
    try {
      const response = await fetch(
        `${BACKEND_URL}/notifications/stores/${storeId}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using mock data');
    }

    // Return mock data if backend is not available
    return NextResponse.json({
      success: true,
      data: MOCK_STATS,
    });
  } catch (error) {
    console.error('Stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
