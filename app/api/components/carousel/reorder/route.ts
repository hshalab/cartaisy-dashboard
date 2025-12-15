import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as carouselService from '@/lib/services/carousel';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    await carouselService.reorderCarousels(session.user.storeId, items);

    return NextResponse.json({
      success: true,
      message: 'Carousel items reordered successfully',
    });
  } catch (error) {
    console.error('Carousel reorder error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder carousels' },
      { status: 500 }
    );
  }
}
