import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import calloutBannerService from '@/lib/services/calloutBanner';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await calloutBannerService.getAll(session.user.storeId);

    return NextResponse.json(
      { success: true, data: banners },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get callout banners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const banner = await calloutBannerService.create(session.user.storeId, body);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'callout_banner',
      resourceId: banner._id.toString(),
      resourceName: banner.title,
      changes: { after: body },
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create callout banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
