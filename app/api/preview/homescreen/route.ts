import { NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import { getHomescreenPreview } from '@/lib/services/preview';

/**
 * GET /api/preview/homescreen
 * Fetches all active components for homescreen preview
 */
export async function GET() {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.storeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const previewData = await getHomescreenPreview(session.user.storeId);

    return NextResponse.json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    console.error('Error fetching homescreen preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homescreen preview' },
      { status: 500 }
    );
  }
}
