import { NextRequest, NextResponse } from 'next/server';
import * as teamService from '@/lib/services/team';

export async function POST(request: NextRequest) {
  try {
    const { token, name, password } = await request.json();

    if (!token || !name || !password) {
      return NextResponse.json(
        { error: 'Token, name, and password are required' },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const userId = await teamService.acceptInvitation(token, name, password);

    return NextResponse.json({
      success: true,
      data: { userId },
      message: 'Invitation accepted successfully',
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    const message = error instanceof Error ? error.message : 'Failed to accept invitation';

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
