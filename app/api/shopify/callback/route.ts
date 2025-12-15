import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Store } from '@/models/Store';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const state = searchParams.get('state');

    if (!code || !shop || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_params`
      );
    }

    if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=config_error`
      );
    }

    // Decode state to get storeId
    let storeId: string;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      storeId = stateData.storeId;
    } catch {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=invalid_state`
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Save to MongoDB
    await connectToDatabase();
    await Store.findByIdAndUpdate(storeId, {
      $set: {
        'shopify.isConnected': true,
        'shopify.shop': shop,
        'shopify.accessToken': accessToken,
        'shopify.connectedAt': new Date(),
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?shopify=connected`
    );
  } catch (error) {
    console.error('Shopify callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=callback_failed`
    );
  }
}
