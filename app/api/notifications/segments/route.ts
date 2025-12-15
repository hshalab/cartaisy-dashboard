import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

// Mock data for development/testing until backend endpoints are ready
const MOCK_SEGMENTS = [
  {
    id: 'all',
    name: 'All Customers',
    description: 'All customers with push notifications enabled',
    count: 1250,
  },
  {
    id: 'inactive_30',
    name: 'Inactive 30 Days',
    description: 'Customers who haven\'t made a purchase in 30 days',
    count: 320,
  },
  {
    id: 'inactive_60',
    name: 'Inactive 60 Days',
    description: 'Customers who haven\'t made a purchase in 60 days',
    count: 180,
  },
  {
    id: 'repeat_customers',
    name: 'Repeat Customers',
    description: 'Customers with 2+ orders',
    count: 450,
  },
  {
    id: 'new_customers',
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    count: 85,
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const session = await getServerSession(authConfig);

    if (!token || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use storeId if available, otherwise use a default for development
    const storeId = session.user.storeId || 'default';

    // Try to fetch from backend first
    try {
      const response = await fetch(
        `${BACKEND_URL}/notifications/stores/${storeId}/segments`,
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
      data: {
        segments: MOCK_SEGMENTS,
      },
    });
  } catch (error) {
    console.error('Segments GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}
