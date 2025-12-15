import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import promoBannerService from '@/lib/services/promoBanner';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    await promoBannerService.reorder(session.user.storeId, items);

    return NextResponse.json(
      { success: true, message: 'Reordered' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reorder promo banners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
