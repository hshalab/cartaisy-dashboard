import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { CarouselItem } from '@/models/CarouselItem';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    await connectToDatabase();

    // Get all carousel items without filter
    const allCarousels = await CarouselItem.find({}).lean();

    // Get carousel items for current store
    const storeCarousels = session?.user?.storeId
      ? await CarouselItem.find({ storeId: session.user.storeId }).lean()
      : [];

    return NextResponse.json({
      session: {
        userId: session?.user?.id,
        storeId: session?.user?.storeId,
        email: session?.user?.email,
      },
      allCarouselsCount: allCarousels.length,
      allCarousels: allCarousels.map(c => ({
        id: c._id,
        title: c.title,
        storeId: c.storeId?.toString(),
      })),
      storeCarouselsCount: storeCarousels.length,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
