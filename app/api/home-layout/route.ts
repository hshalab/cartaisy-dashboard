import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as homeLayoutService from '@/lib/services/homeLayout';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

/**
 * GET /api/home-layout
 * Get home layout sections order
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const layout = await homeLayoutService.getHomeLayout(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: layout,
    });
  } catch (error) {
    console.error('Home layout GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home layout' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/home-layout
 * Update home layout sections order
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sections } = await request.json();

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    const layout = await homeLayoutService.updateHomeLayout(
      session.user.storeId,
      sections
    );

    // Log activity
    await logActivityFromRequest({
      action: 'update',
      resourceType: 'home_layout',
      resourceId: 'home_layout',
      resourceName: 'Home Screen Layout',
      changes: { after: sections },
    });

    return NextResponse.json({
      success: true,
      data: layout,
      message: 'Home layout updated successfully',
    });
  } catch (error) {
    console.error('Home layout PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update home layout' },
      { status: 500 }
    );
  }
}
