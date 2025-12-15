import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import collectionShowcaseService from '@/lib/services/collectionShowcase';
import { logActivityFromRequest } from '@/lib/utils/activityLogger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const showcases = await collectionShowcaseService.getAll(session.user.storeId);

    return NextResponse.json(
      { success: true, data: showcases },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get collection showcases error:', error);
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
    if (!body.type || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: type and title are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['grid', 'circular'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: grid, circular' },
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

    const showcase = await collectionShowcaseService.create(session.user.storeId, body);

    // Log activity
    await logActivityFromRequest({
      action: 'create',
      resourceType: 'collection_showcase',
      resourceId: showcase._id.toString(),
      resourceName: showcase.title,
      changes: { after: body },
    });

    return NextResponse.json(
      { success: true, data: showcase },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create collection showcase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
