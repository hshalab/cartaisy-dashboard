import { NextRequest, NextResponse } from "next/server";

/**
 * Shopify OAuth Callback Handler
 * Receives callback from Shopify and forwards to backend
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get all OAuth params from Shopify
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state");
  const hmac = searchParams.get("hmac");

  // Forward to backend
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";
  const callbackUrl = `${backendUrl}/shopify/oauth/callback?code=${code}&shop=${shop}&state=${state}&hmac=${hmac}`;

  // Redirect to backend callback endpoint
  return NextResponse.redirect(callbackUrl);
}
