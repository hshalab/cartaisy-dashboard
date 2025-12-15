import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import mongoose from 'mongoose';

// The correct store ID where all the data exists
const CORRECT_STORE_ID = '6926c642b33c580ada05d8d0';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Update current user's storeId to the correct one
    const result = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { storeId: new mongoose.Types.ObjectId(CORRECT_STORE_ID) } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'User storeId updated. Please logout and login again.',
      oldStoreId: session.user.storeId,
      newStoreId: CORRECT_STORE_ID,
      user: result?.email,
    });
  } catch (error) {
    console.error('Fix user store error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
