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

    // Use lean() to get plain JS object without Mongoose schema filtering
    const store = await Store.findById(session.user.storeId).lean();

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (!store.shopify?.isConnected || !store.shopify?.accessToken) {
      return NextResponse.json(
        { error: 'Shopify not connected' },
        { status: 400 }
      );
    }

    const shopDomain = store.shopify.shop;
    const accessToken = store.shopify.accessToken;

    // Fetch collections from Shopify API
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/custom_collections.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Shopify API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch from Shopify' },
        { status: response.status }
      );
    }

    const customCollections = await response.json();

    // Also fetch smart collections
    const smartResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/smart_collections.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    let smartCollections = { smart_collections: [] };
    if (smartResponse.ok) {
      smartCollections = await smartResponse.json();
    }

    // Combine both types of collections
    const allCollections = [
      ...(customCollections.custom_collections || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        image: c.image ? { src: c.image.src } : null,
        productsCount: c.products_count || 0,
        type: 'custom',
        updatedAt: c.updated_at,
      })),
      ...(smartCollections.smart_collections || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
        image: c.image ? { src: c.image.src } : null,
        productsCount: c.products_count || 0,
        type: 'smart',
        updatedAt: c.updated_at,
      })),
    ];

    return NextResponse.json({
      data: {
        collections: allCollections
      }
    });
  } catch (error) {
    console.error('Shopify collections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
