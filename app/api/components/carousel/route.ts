import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as carouselService from '@/lib/services/carousel';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carousels = await carouselService.getCarousels(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: carousels,
    });
  } catch (error) {
    console.error('Carousel GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.imageUrl || !data.label || !data.title || !data.subtitle || !data.collectionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const carousel = await carouselService.createCarousel(session.user.storeId, data);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'carousel',
      resourceId: carousel.id,
      resourceName: carousel.title,
      changes: { after: data },
    });

    return NextResponse.json(
      {
        success: true,
        data: carousel,
        message: 'Carousel item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Carousel POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create carousel' },
      { status: 500 }
    );
  }
}
