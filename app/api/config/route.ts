import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, authConfig } from '@/lib/auth/server';

import { connectToDatabase } from '@/lib/db';
import { AppConfig } from '@/models/AppConfig';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const config = await AppConfig.findOne({ storeId: session.user.storeId });

    if (!config) {
      return NextResponse.json({ data: null, message: 'No configuration found' }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !session.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await connectToDatabase();

    let config = await AppConfig.findOne({ storeId: session.user.storeId });

    if (!config) {
      config = new AppConfig({
        storeId: session.user.storeId,
        components: body.components || [],
      });
    } else {
      if (body.components) {
        config.components = body.components;
      }
    }

    await config.save();

    return NextResponse.json({ success: true, data: config }, { status: 200 });
  } catch (error) {
    console.error('Post config error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
