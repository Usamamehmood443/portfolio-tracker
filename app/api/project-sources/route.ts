import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/project-sources - Fetch all project sources
export async function GET() {
  try {
    const sources = await prisma.projectSource.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: sources.map((s) => s.name),
    });
  } catch (error) {
    console.error('Error fetching project sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project sources' },
      { status: 500 }
    );
  }
}

// POST /api/project-sources - Create new project source
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project source name is required' },
        { status: 400 }
      );
    }

    const source = await prisma.projectSource.create({
      data: { name },
    });

    return NextResponse.json({
      success: true,
      data: source,
    });
  } catch (error: any) {
    console.error('Error creating project source:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Project source already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create project source' },
      { status: 500 }
    );
  }
}
