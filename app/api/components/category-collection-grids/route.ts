import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import categoryCollectionGridService from '@/lib/services/categoryCollectionGrid';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const grids = await categoryCollectionGridService.getAll(session.user.storeId);

    return NextResponse.json(
      { success: true, data: grids },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get category collection grids error:', error);
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
    if (!body.title || !body.subtitle) {
      return NextResponse.json(
        { error: 'Missing required fields: title and subtitle are required' },
        { status: 400 }
      );
    }

    // Validate collections array
    if (!body.collections || !Array.isArray(body.collections) || body.collections.length === 0) {
      return NextResponse.json(
        { error: 'At least one collection is required' },
        { status: 400 }
      );
    }

    // Validate each collection item
    for (const collection of body.collections) {
      if (!collection.image || !collection.title || !collection.collectionId) {
        return NextResponse.json(
          { error: 'Each collection must have image, title, and collectionId' },
          { status: 400 }
        );
      }
    }

    const grid = await categoryCollectionGridService.create(session.user.storeId, body);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'category_collection_grid',
      resourceId: grid._id.toString(),
      resourceName: grid.title,
      changes: { after: body },
    });

    return NextResponse.json(
      { success: true, data: grid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category collection grid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
