import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as teamService from '@/lib/services/team';
import { canManageTeam } from '@/lib/utils/permissions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (!canManageTeam(session.user.role)) {
      return NextResponse.json(
        { error: 'Only super admins can remove members' },
        { status: 403 }
      );
    }

    await teamService.removeMember(session.user.storeId, memberId, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Team DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to remove member';

    if (message.includes('Cannot remove')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (!canManageTeam(session.user.role)) {
      return NextResponse.json(
        { error: 'Only super admins can update member roles' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    if (!['super_admin', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    await teamService.updateMemberRole(session.user.storeId, memberId, role, session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully',
    });
  } catch (error) {
    console.error('Team PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update member role';

    if (message.includes('Cannot')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
