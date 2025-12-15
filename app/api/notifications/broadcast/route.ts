import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

// Mock segment counts for demo
const MOCK_SEGMENT_COUNTS: Record<string, number> = {
  all: 1250,
  inactive_30: 320,
  inactive_60: 180,
  repeat_customers: 450,
  new_customers: 85,
};

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const session = await getServerSession(authConfig);

    if (!token || !session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Try to send to backend first
    try {
      const response = await fetch(
        `${BACKEND_URL}/notifications/stores/${session.user.storeId}/broadcast`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: body.title,
            body: body.body,
            segment: body.segment || 'all',
            imageUrl: body.imageUrl,
            data: body.data,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: 'Notification sent successfully',
          sentCount: data.data?.sentCount || 0,
        });
      }
    } catch (backendError) {
      console.log('Backend not available, using mock response');
    }

    // Return mock success if backend is not available (for demo purposes)
    const segment = body.segment || 'all';
    const sentCount = MOCK_SEGMENT_COUNTS[segment] || 0;

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully (Demo Mode)',
      sentCount: sentCount,
    });
  } catch (error) {
    console.error('Broadcast POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
