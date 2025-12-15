import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import categoryCollectionGridService from '@/lib/services/categoryCollectionGrid';
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

    const grid = await categoryCollectionGridService.getById(session.user.storeId, id);

    if (!grid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: grid },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get category collection grid error:', error);
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

    // Get existing grid for change tracking
    const existingGrid = await categoryCollectionGridService.getById(session.user.storeId, id);
    const beforeData = existingGrid ? {
      title: existingGrid.title,
      subtitle: existingGrid.subtitle,
      isActive: existingGrid.isActive,
    } : null;

    const grid = await categoryCollectionGridService.update(
      session.user.storeId,
      id,
      body
    );

    if (!grid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: body.isActive !== undefined && beforeData?.isActive !== body.isActive
        ? (body.isActive ? 'activate' : 'deactivate')
        : 'update',
      resourceType: 'category_collection_grid',
      resourceId: id,
      resourceName: grid.title,
      changes: createChangesObject(beforeData, body),
    });

    return NextResponse.json(
      { success: true, data: grid },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update category collection grid error:', error);
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

    // Get grid details before deletion
    const grid = await categoryCollectionGridService.getById(session.user.storeId, id);
    const resourceName = grid?.title || 'Unknown';

    const deleted = await categoryCollectionGridService.delete(session.user.storeId, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'category_collection_grid',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json(
      { success: true, message: 'Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category collection grid error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
