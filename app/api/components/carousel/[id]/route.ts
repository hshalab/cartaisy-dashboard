import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as carouselService from '@/lib/services/carousel';
import { logActivityFromRequest, createChangesObject } from '@/lib/utils/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const carousel = await carouselService.getCarousel(session.user.storeId, id);

    return NextResponse.json({
      success: true,
      data: carousel,
    });
  } catch (error) {
    console.error('Carousel GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch carousel';

    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Get existing carousel for change tracking
    const existingCarousel = await carouselService.getCarousel(session.user.storeId, id);
    const beforeData = existingCarousel ? {
      title: existingCarousel.title,
      imageUrl: existingCarousel.imageUrl,
      label: existingCarousel.label,
      subtitle: existingCarousel.subtitle,
      ctaText: existingCarousel.ctaText,
      collectionId: existingCarousel.collectionId,
      isActive: existingCarousel.isActive,
    } : null;

    const carousel = await carouselService.updateCarousel(
      session.user.storeId,
      id,
      data
    );

    // Log activity
    await logActivityFromRequest({
      action: data.isActive !== undefined && beforeData?.isActive !== data.isActive
        ? (data.isActive ? 'activate' : 'deactivate')
        : 'update',
      resourceType: 'carousel',
      resourceId: id,
      resourceName: carousel.title,
      changes: createChangesObject(beforeData, data),
    });

    return NextResponse.json({
      success: true,
      data: carousel,
      message: 'Carousel item updated successfully',
    });
  } catch (error) {
    console.error('Carousel PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update carousel';

    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get carousel details before deletion for logging
    const carousel = await carouselService.getCarousel(session.user.storeId, id);
    const resourceName = carousel?.title || 'Unknown';

    await carouselService.deleteCarousel(session.user.storeId, id);

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'carousel',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json({
      success: true,
      message: 'Carousel item deleted successfully',
    });
  } catch (error) {
    console.error('Carousel DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete carousel';

    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes('not found') ? 404 : 500 }
    );
  }
}
