import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OnboardingToken } from '@/models/OnboardingToken';

// Generate secure random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  for (let i = 0; i < 64; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

// Master admin emails who can generate onboarding tokens
const MASTER_ADMINS = ['sufyanali@gmail.com', 'daniyal@cartaisy.com'];

// GET - List all onboarding tokens
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email || !MASTER_ADMINS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Update expired tokens
    await OnboardingToken.updateMany(
      { status: 'pending', expiresAt: { $lt: new Date() } },
      { $set: { status: 'expired' } }
    );

    const tokens = await OnboardingToken.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      data: tokens.map(t => ({
        id: t._id.toString(),
        token: t.token,
        email: t.email,
        storeName: t.storeName,
        status: t.status,
        expiresAt: t.expiresAt,
        usedAt: t.usedAt,
        createdBy: t.createdBy,
        notes: t.notes,
        createdAt: t.createdAt,
        onboardingUrl: `${process.env.NEXTAUTH_URL}/signup?token=${t.token}`,
      })),
    });
  } catch (error) {
    console.error('Get onboarding tokens error:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

// POST - Create new onboarding token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email || !MASTER_ADMINS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, storeName, expiresInHours = 48, notes } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if there's already a pending token for this email
    const existingToken = await OnboardingToken.findOne({
      email: email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingToken) {
      return NextResponse.json({
        error: 'A pending token already exists for this email',
        existingToken: {
          id: existingToken._id.toString(),
          expiresAt: existingToken.expiresAt,
          onboardingUrl: `${process.env.NEXTAUTH_URL}/signup?token=${existingToken.token}`,
        },
      }, { status: 409 });
    }

    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const onboardingToken = await OnboardingToken.create({
      token,
      email: email.toLowerCase(),
      storeName,
      expiresAt,
      createdBy: session.user.email,
      notes,
      status: 'pending',
    });

    const onboardingUrl = `${process.env.NEXTAUTH_URL}/signup?token=${token}`;

    return NextResponse.json({
      success: true,
      data: {
        id: onboardingToken._id.toString(),
        token: onboardingToken.token,
        email: onboardingToken.email,
        storeName: onboardingToken.storeName,
        expiresAt: onboardingToken.expiresAt,
        onboardingUrl,
      },
      message: `Onboarding link created. Share this with the store owner: ${onboardingUrl}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Create onboarding token error:', error);
    return NextResponse.json({
      error: 'Failed to create token',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - Revoke a token
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email || !MASTER_ADMINS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const token = await OnboardingToken.findById(tokenId);
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (token.status === 'used') {
      return NextResponse.json({ error: 'Cannot revoke a used token' }, { status: 400 });
    }

    token.status = 'revoked';
    await token.save();

    return NextResponse.json({
      success: true,
      message: 'Token revoked successfully',
    });
  } catch (error) {
    console.error('Revoke token error:', error);
    return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 });
  }
}
