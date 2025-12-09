import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/platforms - Fetch all platforms
export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: platforms.map((p) => p.name),
    });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// POST /api/platforms - Create new platform
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Platform name is required' },
        { status: 400 }
      );
    }

    const platform = await prisma.platform.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      data: platform,
    });
  } catch (error: any) {
    console.error('Error creating platform:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Platform already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create platform' },
      { status: 500 }
    );
  }
}
