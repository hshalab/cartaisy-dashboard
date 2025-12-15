import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import collectionDisplayService from '@/lib/services/collectionDisplay';
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

    const display = await collectionDisplayService.getById(session.user.storeId, id);

    if (!display) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: display },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get collection display error:', error);
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
    if (body.type && !['large_row', 'small_grid', 'medium_row'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: large_row, small_grid, medium_row' },
        { status: 400 }
      );
    }

    // Get existing display for change tracking
    const existingDisplay = await collectionDisplayService.getById(session.user.storeId, id);
    const beforeData = existingDisplay ? {
      title: existingDisplay.title,
      type: existingDisplay.type,
      collectionId: existingDisplay.collectionId,
      isActive: existingDisplay.isActive,
    } : null;

    const display = await collectionDisplayService.update(
      session.user.storeId,
      id,
      body
    );

    if (!display) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: body.isActive !== undefined && beforeData?.isActive !== body.isActive
        ? (body.isActive ? 'activate' : 'deactivate')
        : 'update',
      resourceType: 'collection_display',
      resourceId: id,
      resourceName: display.title || `${display.type} Display`,
      changes: createChangesObject(beforeData, body),
    });

    return NextResponse.json(
      { success: true, data: display },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update collection display error:', error);
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

    // Get display details before deletion
    const display = await collectionDisplayService.getById(session.user.storeId, id);
    const resourceName = display?.title || `${display?.type || ''} Display`;

    const deleted = await collectionDisplayService.delete(session.user.storeId, id);

    if (!deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Log activity
    await logActivityFromRequest({
      action: 'delete',
      resourceType: 'collection_display',
      resourceId: id,
      resourceName,
    });

    return NextResponse.json(
      { success: true, message: 'Deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete collection display error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
