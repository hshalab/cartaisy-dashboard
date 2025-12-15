import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import {
  getCategoryGridItem,
  updateCategoryGridItem,
  deleteCategoryGridItem,
} from '@/lib/services/categoryGrid';
import { UpdateCategoryGridInput } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    const item = await getCategoryGridItem(storeId, id);

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Category grid item not found' }, { status: 404 });
    }
    console.error('Error fetching category grid item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category grid item' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    const body: UpdateCategoryGridInput = await request.json();

    const updated = await updateCategoryGridItem(storeId, id, body);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Category grid item not found' }, { status: 404 });
    }
    console.error('Error updating category grid item:', error);
    return NextResponse.json(
      { error: 'Failed to update category grid item' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    await deleteCategoryGridItem(storeId, id);

    return NextResponse.json({
      success: true,
      message: 'Category grid item deleted',
    });
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Category grid item not found' }, { status: 404 });
    }
    console.error('Error deleting category grid item:', error);
    return NextResponse.json(
      { error: 'Failed to delete category grid item' },
      { status: 500 }
    );
  }
}
