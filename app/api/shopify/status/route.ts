import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Store } from '@/models/Store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get store's Shopify connection status from MongoDB
    const store = await Store.findById(session.user.storeId);

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        isConnected: store.shopify?.isConnected || false,
        shop: store.shopify?.shop || null,
        connectedAt: store.shopify?.connectedAt || null,
      }
    });
  } catch (error) {
    console.error('Shopify status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify status' },
      { status: 500 }
    );
  }
}
