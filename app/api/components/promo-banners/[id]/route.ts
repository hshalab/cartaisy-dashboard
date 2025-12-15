import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import promoBannerService from '@/lib/services/promoBanner';
import { logActivityFromRequest, createChangesObject } from '@/lib/utils/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banner = await promoBannerService.getById(session.user.storeId, id);

    if (!banner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get promo banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get existing banner for change tracking
    const existingBanner = await promoBannerService.getById(session.user.storeId, id);
    const beforeData = existingBanner ? {
      title: existingBanner.title,
      subtitle: existingBanner.subtitle,
      image: existingBanner.image,
      ctaText: existingBanner.ctaText,
      isActive: existingBanner.isActive,
    } : null;

    const banner = await promoBannerService.update(
      session.user.storeId,
      id,
      body
    );

    if (!banner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: body.isActive !== undefined && beforeData?.isActive !== body.isActive
        ? (body.isActive ? 'activate' : 'deactivate')
        : 'update',
      resourceType: 'promo_banner',
      resourceId: id,
      resourceName: banner.title,
      changes: createChangesObject(beforeData, body),
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update promo banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get banner details before deletion
    const banner = await promoBannerService.getById(session.user.storeId, id);
    const resourceName = banner?.title || 'Unknown';

    const deleted = await promoBannerService.delete(session.user.storeId, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'promo_banner',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json(
      { success: true, message: 'Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete promo banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
