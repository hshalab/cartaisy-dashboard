import { getServerSession, authConfig } from '@/lib/auth/server';

import { reorderCategoryGridItems } from '@/lib/services/categoryGrid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = (session.user as any).storeId;
    const body = await request.json();

    // Validate items array
    if (!Array.isArray(body.items)) {
      return Response.json(
        { error: 'Invalid request: items must be an array' },
        { status: 400 }
      );
    }

    await reorderCategoryGridItems(
      storeId,
      body.items as Array<{ id: string; position: number }>
    );

    return Response.json({
      success: true,
      message: 'Category grid items reordered',
    });
  } catch (error) {
    console.error('Error reordering category grid items:', error);
    return Response.json(
      { error: 'Failed to reorder category grid items' },
      { status: 500 }
    );
  }
}
