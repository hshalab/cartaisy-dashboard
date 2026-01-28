import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // Max 5 requests
const RATE_WINDOW = 60 * 1000; // Per minute

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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 100),
      subject: subject?.trim().slice(0, 200) || 'General Inquiry',
      message: message.trim().slice(0, 5000),
    };

    // Log to console (for development)
    console.log('Contact form submission:', {
      ...sanitizedData,
      timestamp: new Date().toISOString(),
      ip,
    });

    // TODO: Uncomment when Resend is set up
    // Option: Send email via Resend
    // if (process.env.RESEND_API_KEY) {
    //   const { Resend } = await import('resend');
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //
    //   await resend.emails.send({
    //     from: 'Cartaisy Contact <noreply@cartaisy.com>',
    //     to: 'support@cartaisy.com',
    //     replyTo: sanitizedData.email,
    //     subject: `Contact Form: ${sanitizedData.subject}`,
    //     html: `
    //       <h2>New Contact Form Submission</h2>
    //       <p><strong>Name:</strong> ${sanitizedData.name}</p>
    //       <p><strong>Email:</strong> ${sanitizedData.email}</p>
    //       <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
    //       <p><strong>Message:</strong></p>
    //       <p>${sanitizedData.message.replace(/\n/g, '<br>')}</p>
    //       <hr>
    //       <p style="color: #666; font-size: 12px;">
    //         Submitted at: ${new Date().toISOString()}<br>
    //         IP: ${ip}
    //       </p>
    //     `,
    //   });
    // }

    // TODO: Store in database for tracking
    // await db.contactSubmissions.create({ data: sanitizedData });

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
