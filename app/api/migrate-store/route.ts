import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CarouselItem } from '@/models/CarouselItem';
import { PromoBanner } from '@/models/PromoBanner';
import { CalloutBanner } from '@/models/CalloutBanner';
import { CategoryGrid } from '@/models/CategoryGrid';
import { CollectionDisplay } from '@/models/CollectionDisplay';
import { CollectionShowcase } from '@/models/CollectionShowcase';
import { CategoryCollectionGrid } from '@/models/CategoryCollectionGrid';
import mongoose from 'mongoose';

const OLD_STORE_ID = '6926c642b33c580ada05d8d0';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newStoreId = new mongoose.Types.ObjectId(session.user.storeId);
    const oldStoreId = new mongoose.Types.ObjectId(OLD_STORE_ID);

    await connectToDatabase();

    // Migrate all components from old store to new store
    const results = await Promise.all([
      CarouselItem.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      PromoBanner.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      CalloutBanner.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      CategoryGrid.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      CollectionDisplay.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      CollectionShowcase.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
      CategoryCollectionGrid.updateMany(
        { storeId: oldStoreId as any },
        { $set: { storeId: newStoreId } }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Data migrated successfully',
      migrated: {
        carouselItems: results[0].modifiedCount,
        promoBanners: results[1].modifiedCount,
        calloutBanners: results[2].modifiedCount,
        categoryGrids: results[3].modifiedCount,
        collectionDisplays: results[4].modifiedCount,
        collectionShowcases: results[5].modifiedCount,
        categoryCollectionGrids: results[6].modifiedCount,
      },
      oldStoreId: OLD_STORE_ID,
      newStoreId: session.user.storeId,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
