import { getServerSession, authConfig, getAuthToken } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://cartaisy-backend-production.up.railway.app/api/v1';

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const session = await getServerSession(authConfig);

    if (!token || !session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customerId || !body.title || !body.body) {
      return NextResponse.json(
        { error: 'Customer ID, title, and body are required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/notifications/test`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: body.customerId,
          title: body.title,
          body: body.body,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.message || 'Failed to send test notification' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Test notification POST error:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
