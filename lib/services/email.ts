/**
 * Email and invitation URL generation service
 * Note: Actual email sending can be implemented later with providers like SendGrid, Resend, etc.
 */

const DASHBOARD_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Generate invite acceptance URL
 */
export function generateInviteUrl(token: string): string {
  return `${DASHBOARD_URL}/invite/accept?token=${token}`;
}

/**
 * Generate invite email content (for sending later)
 */
export function generateInviteEmailContent(
  inviterEmail: string,
  storeName: string,
  inviteUrl: string
): { subject: string; text: string; html: string } {
  const subject = `You're invited to join ${storeName} on Cartaisy Dashboard`;

  const text = `
You've been invited to join ${storeName} on Cartaisy Dashboard by ${inviterEmail}.

Click the link below to accept the invitation:
${inviteUrl}

This invitation will expire in 24 hours.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
    .content { line-height: 1.6; }
    .button { background: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 20px 0; }
    .footer { color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>You're invited to ${storeName}</h2>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>${inviterEmail} has invited you to join <strong>${storeName}</strong> on Cartaisy Dashboard.</p>
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
      <p>If the button above doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${inviteUrl}</p>
    </div>
    <div class="footer">
      <p>This invitation will expire in 24 hours.</p>
      <p>© Cartaisy Dashboard</p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

/**
 * Send invitation email
 * Currently a stub - implement with actual email provider
 */
export async function sendInvitationEmail(
  toEmail: string,
  inviterEmail: string,
  storeName: string,
  inviteUrl: string
): Promise<void> {
  // TODO: Implement with email provider (SendGrid, Resend, AWS SES, etc.)
  // For now, just generate content
  const emailContent = generateInviteEmailContent(inviterEmail, storeName, inviteUrl);

  console.log('Email would be sent to:', toEmail);
  console.log('Subject:', emailContent.subject);
  console.log('Invite URL:', inviteUrl);

  // Example implementation with Resend (uncomment and install resend):
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'noreply@cartaisy.com',
    to: toEmail,
    subject: emailContent.subject,
    html: emailContent.html,
  });
  */
}

/**
 * Generate onboarding email content for store owners
 */
export function generateOnboardingEmailContent(
  storeName: string | undefined,
  onboardingUrl: string,
  expiresInHours: number
): { subject: string; text: string; html: string } {
  const subject = 'Welcome to Cartaisy - Complete Your Account Setup';
  const expiresText = expiresInHours >= 24
    ? `${Math.floor(expiresInHours / 24)} day${expiresInHours >= 48 ? 's' : ''}`
    : `${expiresInHours} hours`;

  const text = `
Welcome to Cartaisy!

You've been invited to set up your${storeName ? ` ${storeName}` : ''} store on Cartaisy Dashboard.

Click the link below to create your account:
${onboardingUrl}

This link will expire in ${expiresText}.

If you didn't request this, you can safely ignore this email.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 30px; }
    h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
    .content { line-height: 1.7; color: #475569; }
    .button { background: #2563eb; color: white !important; padding: 14px 28px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 25px 0; font-weight: 500; }
    .link-box { background: #f8fafc; padding: 15px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #64748b; margin: 20px 0; border: 1px solid #e2e8f0; }
    .footer { color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .expires { background: #fef3c7; color: #92400e; padding: 10px 15px; border-radius: 6px; font-size: 14px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Cartaisy</div>
      <h1>Welcome to Cartaisy!</h1>
      <div class="content">
        <p>You've been invited to set up your${storeName ? ` <strong>${storeName}</strong>` : ''} store on Cartaisy Dashboard.</p>
        <p>Click the button below to create your account and get started:</p>
        <a href="${onboardingUrl}" class="button">Create Your Account</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <div class="link-box">${onboardingUrl}</div>
        <div class="expires">This link will expire in ${expiresText}.</div>
      </div>
      <div class="footer">
        <p>If you didn't request this email, you can safely ignore it.</p>
        <p>&copy; Cartaisy Dashboard</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

/**
 * Send onboarding email to store owner
 */
export async function sendOnboardingEmail(
  toEmail: string,
  storeName: string | undefined,
  onboardingUrl: string,
  expiresInHours: number
): Promise<void> {
  const emailContent = generateOnboardingEmailContent(storeName, onboardingUrl, expiresInHours);

  console.log('=== ONBOARDING EMAIL ===');
  console.log('To:', toEmail);
  console.log('Subject:', emailContent.subject);
  console.log('Onboarding URL:', onboardingUrl);
  console.log('========================');

  // TODO: Implement with actual email provider
  // For now, just logs - implement with Resend, SendGrid, etc.
}
