import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

// Mock detail data for development/testing
const MOCK_NOTIFICATIONS: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Flash Sale - 50% Off!',
    body: 'Today only! Get 50% off everything. Use code FLASH50 at checkout.',
    segment: 'all',
    status: 'sent',
    targetCount: 1250,
    successCount: 1180,
    failureCount: 70,
    deliveryRate: 94.4,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentByEmail: 'admin@store.com',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { promoCode: 'FLASH50', discount: '50' },
    failedTokens: [
      { token: 'token_xxx1', error: 'NotRegistered', errorCode: 'messaging/registration-token-not-registered' },
      { token: 'token_xxx2', error: 'InvalidRegistration', errorCode: 'messaging/invalid-registration-token' },
    ],
  },
  '2': {
    id: '2',
    title: 'We Miss You!',
    body: 'It\'s been a while since your last visit. Come back for 20% off your next order!',
    segment: 'inactive_30',
    status: 'sent',
    targetCount: 320,
    successCount: 298,
    failureCount: 22,
    deliveryRate: 93.1,
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    sentByEmail: 'admin@store.com',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    data: { promoCode: 'WELCOME20', discount: '20' },
  },
  '3': {
    id: '3',
    title: 'New Collection Arrived!',
    body: 'Check out our latest arrivals - fresh styles just for you.',
    segment: 'repeat_customers',
    status: 'partial',
    targetCount: 450,
    successCount: 380,
    failureCount: 70,
    deliveryRate: 84.4,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentByEmail: 'marketing@store.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://cdn.shopify.com/s/files/1/0000/0000/0001/products/new-collection.jpg',
    failedTokens: Array.from({ length: 70 }, (_, i) => ({
      token: `token_failed_${i}`,
      error: 'NotRegistered',
      errorCode: 'messaging/registration-token-not-registered',
    })),
  },
  '4': {
    id: '4',
    title: 'Welcome to Our Store!',
    body: 'Thanks for joining! Here\'s 15% off your first purchase.',
    segment: 'new_customers',
    status: 'sent',
    targetCount: 85,
    successCount: 85,
    failureCount: 0,
    deliveryRate: 100,
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    sentByEmail: 'admin@store.com',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    data: { promoCode: 'WELCOME15', discount: '15' },
  },
  '5': {
    id: '5',
    title: 'Weekend Special',
    body: 'Free shipping on all orders this weekend!',
    segment: 'all',
    status: 'failed',
    targetCount: 1250,
    successCount: 0,
    failureCount: 1250,
    deliveryRate: 0,
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentByEmail: 'admin@store.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    failedTokens: [
      { token: 'all', error: 'Firebase service unavailable', errorCode: 'messaging/server-unavailable' },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getAuthToken();
    const session = await getServerSession(authConfig);

    if (!token || !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = session.user.storeId || 'default';
    const { id } = await params;

    // Try to fetch from backend first
    try {
      const response = await fetch(
        `${BACKEND_URL}/notifications/stores/${storeId}/history/${id}`,
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

    // Return mock data
    const notification = MOCK_NOTIFICATIONS[id];
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Notification detail GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification detail' },
      { status: 500 }
    );
  }
}
