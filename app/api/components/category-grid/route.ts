import { getServerSession, authConfig } from '@/lib/auth/server';

import { getCategoryGridItems, createCategoryGridItem } from '@/lib/services/categoryGrid';
import { CreateCategoryGridInput } from '@/types';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    const items = await getCategoryGridItems(storeId);

    return Response.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching category grid items:', error);
    return Response.json(
      { error: 'Failed to fetch category grid items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    const body: CreateCategoryGridInput = await request.json();

    // Validation
    if (!body.imageUrl || !body.title || !body.collectionId) {
      return Response.json(
        { error: 'Missing required fields: imageUrl, title, collectionId' },
        { status: 400 }
      );
    }

    const item = await createCategoryGridItem(storeId, body);

    return Response.json(
      {
        success: true,
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category grid item:', error);
    return Response.json(
      { error: 'Failed to create category grid item' },
      { status: 500 }
    );
  }
}
