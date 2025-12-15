import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import collectionShowcaseService from '@/lib/services/collectionShowcase';
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

    const showcase = await collectionShowcaseService.getById(session.user.storeId, id);

    if (!showcase) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: showcase },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get collection showcase error:', error);
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

    // Validate type if provided
    if (body.type && !['grid', 'circular'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: grid, circular' },
        { status: 400 }
      );
    }

    // Validate collections array if provided
    if (body.collections !== undefined) {
      if (!Array.isArray(body.collections) || body.collections.length === 0) {
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
    }

    // Get existing showcase for change tracking
    const existingShowcase = await collectionShowcaseService.getById(session.user.storeId, id);
    const beforeData = existingShowcase ? {
      title: existingShowcase.title,
      type: existingShowcase.type,
      isActive: existingShowcase.isActive,
    } : null;

    const showcase = await collectionShowcaseService.update(
      session.user.storeId,
      id,
      body
    );

    if (!showcase) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: body.isActive !== undefined && beforeData?.isActive !== body.isActive
        ? (body.isActive ? 'activate' : 'deactivate')
        : 'update',
      resourceType: 'collection_showcase',
      resourceId: id,
      resourceName: showcase.title,
      changes: createChangesObject(beforeData, body),
    });

    return NextResponse.json(
      { success: true, data: showcase },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update collection showcase error:', error);
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

    // Get showcase details before deletion
    const showcase = await collectionShowcaseService.getById(session.user.storeId, id);
    const resourceName = showcase?.title || 'Unknown';

    const deleted = await collectionShowcaseService.delete(session.user.storeId, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'collection_showcase',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json(
      { success: true, message: 'Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete collection showcase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
