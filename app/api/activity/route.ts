import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import { getActivities, getTeamMembersForFilter } from '@/lib/services/activity';

/**
 * GET /api/activity
 * Get activity log with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;
    const includeTeamMembers = searchParams.get('includeTeamMembers') === 'true';

    // All team members can see store activities
    // userId filter is optional (super_admin can filter by user)
    const effectiveUserId = userId;

    const { activities, total } = await getActivities({
      storeId: session.user.storeId,
      userId: effectiveUserId,
      action,
      resourceType,
      startDate,
      endDate,
      search,
      limit,
      offset,
    });

    // Optionally include team members for filter dropdown
    let teamMembers;
    if (includeTeamMembers && session.user.role === 'super_admin') {
      teamMembers = await getTeamMembersForFilter(session.user.storeId);
    }

    return NextResponse.json({
      success: true,
      data: {
        activities,
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
        ...(teamMembers && { teamMembers }),
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
