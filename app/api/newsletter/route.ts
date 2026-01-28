import { NextRequest, NextResponse } from 'next/server';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.timestamp > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// Simple in-memory store (replace with database in production)
const subscribers = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    if (subscribers.has(normalizedEmail)) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }

    // Add to subscribers (in-memory for now)
    subscribers.add(normalizedEmail);

    // Log for development
    console.log('New newsletter subscriber:', normalizedEmail);
    console.log('Total subscribers:', subscribers.size);

    // TODO: Integrate with email service (Mailchimp, ConvertKit, Resend Audiences)
    // Example with Resend Audiences:
    // if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
    //   const { Resend } = await import('resend');
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.contacts.create({
    //     email: normalizedEmail,
    //     audienceId: process.env.RESEND_AUDIENCE_ID,
    //   });
    // }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscriber count (for admin use)
export async function GET() {
  return NextResponse.json({ count: subscribers.size });
}
