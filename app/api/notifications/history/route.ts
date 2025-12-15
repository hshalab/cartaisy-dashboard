import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

// Mock data for development/testing
const MOCK_HISTORY = {
  notifications: [
    {
      id: '1',
      title: 'Flash Sale - 50% Off!',
      body: 'Today only! Get 50% off everything. Use code FLASH50 at checkout.',
      segment: 'all',
      status: 'sent' as const,
      targetCount: 1250,
      successCount: 1180,
      failureCount: 70,
      deliveryRate: 94.4,
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentByEmail: 'admin@store.com',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'We Miss You!',
      body: 'It\'s been a while since your last visit. Come back for 20% off your next order!',
      segment: 'inactive_30',
      status: 'sent' as const,
      targetCount: 320,
      successCount: 298,
      failureCount: 22,
      deliveryRate: 93.1,
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      sentByEmail: 'admin@store.com',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'New Collection Arrived!',
      body: 'Check out our latest arrivals - fresh styles just for you.',
      segment: 'repeat_customers',
      status: 'partial' as const,
      targetCount: 450,
      successCount: 380,
      failureCount: 70,
      deliveryRate: 84.4,
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      sentByEmail: 'marketing@store.com',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Welcome to Our Store!',
      body: 'Thanks for joining! Here\'s 15% off your first purchase.',
      segment: 'new_customers',
      status: 'sent' as const,
      targetCount: 85,
      successCount: 85,
      failureCount: 0,
      deliveryRate: 100,
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      sentByEmail: 'admin@store.com',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'Weekend Special',
      body: 'Free shipping on all orders this weekend!',
      segment: 'all',
      status: 'failed' as const,
      targetCount: 1250,
      successCount: 0,
      failureCount: 1250,
      deliveryRate: 0,
      sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sentByEmail: 'admin@store.com',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 5,
    totalPages: 1,
  },
};

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const session = await getServerSession(authConfig);

    if (!token || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = session.user.storeId || 'default';
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const status = searchParams.get('status') || '';
    const segment = searchParams.get('segment') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Try to fetch from backend first
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (status) params.append('status', status);
      if (segment) params.append('segment', segment);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `${BACKEND_URL}/notifications/stores/${storeId}/history?${params.toString()}`,
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

    // Filter mock data based on params
    let filteredNotifications = [...MOCK_HISTORY.notifications];

    if (status) {
      filteredNotifications = filteredNotifications.filter(n => n.status === status);
    }
    if (segment) {
      filteredNotifications = filteredNotifications.filter(n => n.segment === segment);
    }
    if (startDate) {
      const start = new Date(startDate);
      filteredNotifications = filteredNotifications.filter(n => new Date(n.sentAt || n.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredNotifications = filteredNotifications.filter(n => new Date(n.sentAt || n.createdAt) <= end);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = filteredNotifications.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + limitNum);

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
}
