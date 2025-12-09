import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/developers - Fetch all developers
export async function GET() {
  try {
    const developers = await prisma.developer.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: developers.map((d) => d.name),
    });
  } catch (error) {
    console.error('Error fetching developers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch developers' },
      { status: 500 }
    );
  }
}

// POST /api/developers - Create new developer
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Developer name is required' },
        { status: 400 }
      );
    }

    const developer = await prisma.developer.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      data: developer,
    });
  } catch (error: any) {
    console.error('Error creating developer:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Developer already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create developer' },
      { status: 500 }
    );
  }
}
