import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Store } from '@/models/Store';
import { OnboardingToken } from '@/models/OnboardingToken';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { email, password, storeName, token } = await request.json();

    // Validate input
    if (!email || !password || !storeName) {
      return NextResponse.json(
        { message: 'Email, password, and store name are required' },
        { status: 400 }
      );
    }

    // Token is required for signup
    if (!token) {
      return NextResponse.json(
        { message: 'Valid onboarding token is required to sign up' },
        { status: 403 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (storeName.length < 2) {
      return NextResponse.json(
        { message: 'Store name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Validate onboarding token
    const onboardingToken = await OnboardingToken.findOne({ token });

    if (!onboardingToken) {
      return NextResponse.json(
        { message: 'Invalid onboarding token' },
        { status: 403 }
      );
    }

    // Check if token is expired
    if (new Date() > onboardingToken.expiresAt) {
      if (onboardingToken.status === 'pending') {
        onboardingToken.status = 'expired';
        await onboardingToken.save();
      }
      return NextResponse.json(
        { message: 'Onboarding token has expired' },
        { status: 403 }
      );
    }

    // Check if token is already used
    if (onboardingToken.status === 'used') {
      return NextResponse.json(
        { message: 'Onboarding token has already been used' },
        { status: 403 }
      );
    }

    // Check if token is revoked
    if (onboardingToken.status === 'revoked') {
      return NextResponse.json(
        { message: 'Onboarding token has been revoked' },
        { status: 403 }
      );
    }

    // Verify email matches token (if token has email restriction)
    if (onboardingToken.email && onboardingToken.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { message: 'Email does not match the onboarding invitation' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create slug from store name
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if store slug already exists, if so add random suffix
    let finalSlug = slug;
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      finalSlug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create store first
    const store = await Store.create({
      name: storeName,
      slug: finalSlug,
      shopify: {
        isConnected: false,
      },
      plan: {
        type: 'free',
        maxMembers: 5,
      },
      settings: {
        timezone: 'UTC',
        currency: 'USD',
      },
      isActive: true,
    });

    // Derive name from email
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Create user with store reference
    const user = await User.create({
      email: email.toLowerCase(),
      password, // Will be hashed by mongoose pre-save hook
      storeId: store._id.toString(),
      storeName: storeName,
      role: 'super_admin', // First user is super_admin
      name,
      isActive: true,
    });

    // Mark token as used
    onboardingToken.status = 'used';
    onboardingToken.usedAt = new Date();
    onboardingToken.usedBy = new mongoose.Types.ObjectId(user._id);
    await onboardingToken.save();

    return NextResponse.json(
      {
        message: 'User and store created successfully',
        userId: user._id.toString(),
        storeId: store._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
