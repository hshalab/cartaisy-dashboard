import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import * as teamService from '@/lib/services/team';
import { Store } from '@/models/Store';
import { connectToDatabase } from '@/lib/db';
import { canManageTeam, getMemberLimit } from '@/lib/utils/permissions';
import { generateInviteUrl, sendInvitationEmail } from '@/lib/services/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team members and pending invitations
    const [members, pendingInvitations] = await Promise.all([
      teamService.getTeamMembers(session.user.storeId),
      teamService.getPendingInvitations(session.user.storeId),
    ]);

    return NextResponse.json({
      success: true,
      data: { members, pendingInvitations },
    });
  } catch (error) {
    console.error('Team GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session.user.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    if (!canManageTeam(session.user.role)) {
      return NextResponse.json(
        { error: 'Only super admins can invite members' },
        { status: 403 }
      );
    }

    const { email, role = 'admin' } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check team member limit
    await connectToDatabase();
    const store = await Store.findById(session.user.storeId);
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    const memberCount = await teamService.getTeamMemberCount(session.user.storeId);
    const limit = getMemberLimit(store.plan?.type);

    if (memberCount >= limit) {
      return NextResponse.json(
        {
          error: 'Team member limit reached',
          message: `Your ${store.plan?.type || 'free'} plan allows up to ${limit} members. Upgrade to add more.`,
        },
        { status: 400 }
      );
    }

    // Send invitation
    const invitation = await teamService.inviteMember(
      session.user.storeId,
      session.user.id,
      email,
      role
    );

    // Generate invite URL and send email
    const inviteUrl = generateInviteUrl(invitation.inviteToken);
    await sendInvitationEmail(
      email,
      session.user.email || '',
      session.user.storeName || 'Your Store',
      inviteUrl
    );

    return NextResponse.json(
      {
        success: true,
        data: { ...invitation, inviteUrl },
        message: 'Invitation sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Team POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send invitation';

    return NextResponse.json(
      { error: message },
      { status: error instanceof Error && message.includes('already') ? 409 : 500 }
    );
  }
}
