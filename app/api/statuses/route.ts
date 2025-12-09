import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/statuses - Fetch all statuses
export async function GET() {
  try {
    const statuses = await prisma.status.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: statuses.map((s) => s.name),
    });
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}

// POST /api/statuses - Create new status
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Status name is required' },
        { status: 400 }
      );
    }

    const status = await prisma.status.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('Error creating status:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Status already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create status' },
      { status: 500 }
    );
  }
}
