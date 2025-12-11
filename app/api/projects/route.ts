import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProjectEmbedding } from '@/lib/embeddings';

// GET /api/projects - Fetch all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        features: {
          include: {
            feature: true,
          },
        },
        developers: {
          include: {
            developer: true,
          },
        },
        screenshots: true,
        video: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match frontend expectations
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      projectTitle: project.projectTitle,
      clientName: project.clientName,
      projectSource: project.projectSource,
      projectUrl: project.projectUrl,
      category: project.category,
      shortDescription: project.shortDescription,
      platform: project.platform,
      status: project.status,
      proposedBudget: project.proposedBudget,
      finalizedBudget: project.finalizedBudget,
      estimatedDuration: project.estimatedDuration,
      deliveredDuration: project.deliveredDuration,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString() || null,
      tagline: project.tagline,
      proposal: project.proposal,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      features: project.features.map((f) => f.feature.name),
      developers: project.developers.map((d) => d.developer.name),
      screenshots: project.screenshots.map((s) => ({
        id: s.id,
        fileName: s.fileName,
        filePath: s.filePath,
        fileSize: s.fileSize,
        mimeType: s.mimeType,
        createdAt: s.createdAt.toISOString(),
      })),
      video: project.video
        ? {
            id: project.video.id,
            fileName: project.video.fileName,
            filePath: project.video.filePath,
            fileSize: project.video.fileSize,
            mimeType: project.video.mimeType,
            createdAt: project.video.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      projectTitle,
      clientName,
      projectSource,
      projectUrl,
      category,
      shortDescription,
      platform,
      status,
      proposedBudget,
      finalizedBudget,
      estimatedDuration,
      deliveredDuration,
      startDate,
      endDate,
      tagline,
      proposal,
      features,
      developers,
      screenshots,
      video,
    } = body;

    // Create project with relations
    const project = await prisma.project.create({
      data: {
        projectTitle,
        clientName,
        projectSource,
        projectUrl: projectUrl || null,
        category,
        shortDescription,
        platform,
        status: status || 'Pending',
        proposedBudget: proposedBudget ? parseFloat(proposedBudget) : null,
        finalizedBudget: finalizedBudget ? parseFloat(finalizedBudget) : null,
        estimatedDuration,
        deliveredDuration: deliveredDuration || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        tagline: tagline || null,
        proposal: proposal || null,
        features: {
          create: await Promise.all(
            (features || []).map(async (featureName: string) => {
              // Find or create feature
              let feature = await prisma.feature.findUnique({
                where: { name: featureName },
              });

              if (!feature) {
                feature = await prisma.feature.create({
                  data: { name: featureName },
                });
              }

              return {
                featureId: feature.id,
              };
            })
          ),
        },
        developers: {
          create: await Promise.all(
            (developers || []).map(async (developerName: string) => {
              // Find or create developer
              let developer = await prisma.developer.findUnique({
                where: { name: developerName },
              });

              if (!developer) {
                developer = await prisma.developer.create({
                  data: { name: developerName },
                });
              }

              return {
                developerId: developer.id,
              };
            })
          ),
        },
        screenshots: {
          create: (screenshots || []).map((screenshot: any) => ({
            fileName: screenshot.fileName,
            filePath: screenshot.filePath,
            fileSize: screenshot.fileSize,
            mimeType: screenshot.mimeType,
          })),
        },
        video: video
          ? {
              create: {
                fileName: video.fileName,
                filePath: video.filePath,
                fileSize: video.fileSize,
                mimeType: video.mimeType,
              },
            }
          : undefined,
      },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
        developers: {
          include: {
            developer: true,
          },
        },
        screenshots: true,
        video: true,
      },
    });

    // Generate embedding for the new project (async, non-blocking)
    if (process.env.OPENAI_API_KEY) {
      try {
        const projectForEmbedding = {
          projectTitle: project.projectTitle,
          clientName: project.clientName,
          shortDescription: project.shortDescription,
          tagline: project.tagline,
          proposal: project.proposal,
          category: project.category,
          platform: project.platform,
          features: project.features.map((f) => f.feature.name),
          developers: project.developers.map((d) => d.developer.name),
        };

        const { searchableText, embedding } = await generateProjectEmbedding(projectForEmbedding);

        await prisma.project.update({
          where: { id: project.id },
          data: { searchableText, embedding },
        });
      } catch (embeddingError) {
        // Log error but don't fail the request
        console.error('Error generating embedding for new project:', embeddingError);
      }
    }

    // Transform response
    const transformedProject = {
      id: project.id,
      projectTitle: project.projectTitle,
      clientName: project.clientName,
      projectSource: project.projectSource,
      projectUrl: project.projectUrl,
      category: project.category,
      shortDescription: project.shortDescription,
      platform: project.platform,
      status: project.status,
      proposedBudget: project.proposedBudget,
      finalizedBudget: project.finalizedBudget,
      estimatedDuration: project.estimatedDuration,
      deliveredDuration: project.deliveredDuration,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate?.toISOString() || null,
      tagline: project.tagline,
      proposal: project.proposal,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      features: project.features.map((f) => f.feature.name),
      developers: project.developers.map((d) => d.developer.name),
      screenshots: project.screenshots.map((s) => ({
        id: s.id,
        fileName: s.fileName,
        filePath: s.filePath,
        fileSize: s.fileSize,
        mimeType: s.mimeType,
        createdAt: s.createdAt.toISOString(),
      })),
      video: project.video
        ? {
            id: project.video.id,
            fileName: project.video.fileName,
            filePath: project.video.filePath,
            fileSize: project.video.fileSize,
            mimeType: project.video.mimeType,
            createdAt: project.video.createdAt.toISOString(),
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      data: transformedProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
