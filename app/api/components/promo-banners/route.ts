import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import promoBannerService from '@/lib/services/promoBanner';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const banners = await promoBannerService.getAll(session.user.storeId);

    return NextResponse.json(
      { success: true, data: banners },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get promo banners error:', error);
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

    // Validate required fields
    if (!body.image || !body.title || !body.subtitle || !body.ctaText || !body.collectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: image, title, subtitle, ctaText, and collectionId are required' },
        { status: 400 }
      );
    }

    const banner = await promoBannerService.create(session.user.storeId, body);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'promo_banner',
      resourceId: banner._id.toString(),
      resourceName: banner.title,
      changes: { after: body },
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create promo banner error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
