import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import calloutBannerService from '@/lib/services/calloutBanner';
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

    const banner = await calloutBannerService.getById(session.user.storeId, id);

    if (!banner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get callout banner error:', error);
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
    const existingBanner = await calloutBannerService.getById(session.user.storeId, id);
    const beforeData = existingBanner ? {
      title: existingBanner.title,
      subTitle: existingBanner.subTitle,
      imageUrl: existingBanner.imageUrl,
      buttonText: existingBanner.buttonText,
      isActive: existingBanner.isActive,
    } : null;

    const banner = await calloutBannerService.update(
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
      resourceType: 'callout_banner',
      resourceId: id,
      resourceName: banner.title,
      changes: createChangesObject(beforeData, body),
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update callout banner error:', error);
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
    const banner = await calloutBannerService.getById(session.user.storeId, id);
    const resourceName = banner?.title || 'Unknown';

    const deleted = await calloutBannerService.delete(session.user.storeId, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'callout_banner',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json(
      { success: true, message: 'Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete callout banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
