import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as storeService from '@/lib/services/store';
import { canManageSettings } from '@/lib/utils/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await storeService.getStore(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error('Store GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (!canManageSettings(session.user.role)) {
      return NextResponse.json(
        { error: 'Only super admins can update store settings' },
        { status: 403 }
      );
    }

    const input = await request.json();

    const store = await storeService.updateStore(session.user.storeId, input);

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Store PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update store';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (!canManageSettings(session.user.role)) {
      return NextResponse.json(
        { error: 'Only super admins can delete stores' },
        { status: 403 }
      );
    }

    await storeService.deleteStore(session.user.storeId);

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Store DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete store';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
