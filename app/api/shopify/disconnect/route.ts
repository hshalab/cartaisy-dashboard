import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Store } from '@/models/Store';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Update store to disconnect Shopify
    await Store.findByIdAndUpdate(session.user.storeId, {
      $set: {
        'shopify.isConnected': false,
        'shopify.shop': null,
        'shopify.accessToken': null,
        'shopify.connectedAt': null,
      }
    });

    return NextResponse.json({
      message: 'Shopify disconnected successfully'
    });
  } catch (error) {
    console.error('Shopify disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Shopify' },
      { status: 500 }
    );
  }
}
