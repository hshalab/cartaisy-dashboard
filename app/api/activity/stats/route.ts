import { NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import { getActivityStats } from '@/lib/services/activity';

/**
 * GET /api/activity/stats
 * Get activity statistics for the store
 */
export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only super_admin can see full stats
    if (session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    const stats = await getActivityStats(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}
