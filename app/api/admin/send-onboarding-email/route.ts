import { getServerSession, authConfig } from '@/lib/auth/server';

import { NextRequest, NextResponse } from 'next/server';
import { sendOnboardingEmail } from '@/lib/services/email';

// Master admin emails who can send onboarding emails
const MASTER_ADMINS = ['sufyanali@gmail.com', 'daniyal@cartaisy.com'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email || !MASTER_ADMINS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, storeName, onboardingUrl, expiresInHours = 48 } = await request.json();

    if (!email || !onboardingUrl) {
      return NextResponse.json(
        { error: 'Email and onboarding URL are required' },
        { status: 400 }
      );
    }

    await sendOnboardingEmail(email, storeName, onboardingUrl, expiresInHours);

    return NextResponse.json({
      success: true,
      message: 'Onboarding email sent successfully',
    });
  } catch (error) {
    console.error('Send onboarding email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
