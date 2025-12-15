import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import collectionDisplayService from '@/lib/services/collectionDisplay';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const displays = await collectionDisplayService.getAll(session.user.storeId);

    return NextResponse.json(
      { success: true, data: displays },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get collection displays error:', error);
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
    if (!body.type || !body.collectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and collectionId are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['large_row', 'small_grid', 'medium_row'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: large_row, small_grid, medium_row' },
        { status: 400 }
      );
    }

    const display = await collectionDisplayService.create(session.user.storeId, body);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'collection_display',
      resourceId: display._id.toString(),
      resourceName: body.title || `${body.type} Display`,
      changes: { after: body },
    });

    return NextResponse.json(
      { success: true, data: display },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create collection display error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
