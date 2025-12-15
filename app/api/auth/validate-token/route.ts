import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OnboardingToken } from '@/models/OnboardingToken';

// GET - Validate an onboarding token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        valid: false,
        error: 'Token is required'
      }, { status: 400 });
    }

    await connectToDatabase();

    const onboardingToken = await OnboardingToken.findOne({ token });

    if (!onboardingToken) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid token'
      }, { status: 404 });
    }

    // Check if token is expired
    if (new Date() > onboardingToken.expiresAt) {
      if (onboardingToken.status === 'pending') {
        onboardingToken.status = 'expired';
        await onboardingToken.save();
      }
      return NextResponse.json({
        valid: false,
        error: 'Token has expired'
      }, { status: 410 });
    }

    // Check if token is already used
    if (onboardingToken.status === 'used') {
      return NextResponse.json({
        valid: false,
        error: 'Token has already been used'
      }, { status: 410 });
    }

    // Check if token is revoked
    if (onboardingToken.status === 'revoked') {
      return NextResponse.json({
        valid: false,
        error: 'Token has been revoked'
      }, { status: 410 });
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      data: {
        email: onboardingToken.email,
        storeName: onboardingToken.storeName,
        expiresAt: onboardingToken.expiresAt,
      },
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Failed to validate token'
    }, { status: 500 });
  }
}
