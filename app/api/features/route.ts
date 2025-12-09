import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/features - Fetch all features
export async function GET() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: features.map((f) => f.name),
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}

// POST /api/features - Create new feature
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Feature name is required' },
        { status: 400 }
      );
    }

    const feature = await prisma.feature.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      data: feature,
    });
  } catch (error: any) {
    console.error('Error creating feature:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Feature already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create feature' },
      { status: 500 }
    );
  }
}
