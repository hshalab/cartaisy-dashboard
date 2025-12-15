import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as storeService from '@/lib/services/store';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await storeService.getStoreStats(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Store stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store stats' },
      { status: 500 }
    );
  }
}
