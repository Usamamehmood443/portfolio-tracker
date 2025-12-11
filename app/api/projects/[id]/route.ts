import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProjectEmbedding } from '@/lib/embeddings';

// GET /api/projects/[id] - Fetch single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
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

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform data
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
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();

    // Extract basic fields
    const projectTitle = formData.get('projectTitle') as string;
    const clientName = formData.get('clientName') as string;
    const projectSource = formData.get('projectSource') as string;
    const projectUrl = formData.get('projectUrl') as string | null;
    const category = formData.get('category') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const platform = formData.get('platform') as string;
    const status = formData.get('status') as string;
    const proposedBudget = formData.get('proposedBudget') as string | null;
    const finalizedBudget = formData.get('finalizedBudget') as string | null;
    const estimatedDuration = formData.get('estimatedDuration') as string;
    const deliveredDuration = formData.get('deliveredDuration') as string | null;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string | null;
    const tagline = formData.get('tagline') as string | null;
    const proposal = formData.get('proposal') as string | null;
    const features = JSON.parse(formData.get('features') as string || '[]');
    const developers = JSON.parse(formData.get('developers') as string || '[]');

    // Extract media operations
    const screenshotsToDelete = JSON.parse(formData.get('screenshotsToDelete') as string || '[]');
    const deleteVideo = formData.get('deleteVideo') === 'true';

    // Extract file uploads
    const screenshotFiles = formData.getAll('screenshots') as File[];
    const videoFile = formData.get('video') as File | null;

    // Delete existing features and developers relations
    await prisma.projectFeature.deleteMany({
      where: { projectId: params.id },
    });

    await prisma.projectDeveloper.deleteMany({
      where: { projectId: params.id },
    });

    // Delete specific screenshots
    if (screenshotsToDelete.length > 0) {
      const screenshotsToRemove = await prisma.screenshot.findMany({
        where: {
          id: { in: screenshotsToDelete },
          projectId: params.id,
        },
      });

      // Delete files from filesystem
      const fs = require('fs').promises;
      const path = require('path');
      for (const screenshot of screenshotsToRemove) {
        const filePath = path.join(process.cwd(), 'public', screenshot.filePath.replace('/uploads/', 'uploads/'));
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting screenshot file:', err);
        }
      }

      // Delete from database
      await prisma.screenshot.deleteMany({
        where: {
          id: { in: screenshotsToDelete },
        },
      });
    }

    // Delete video if requested
    if (deleteVideo) {
      const existingVideo = await prisma.video.findUnique({
        where: { projectId: params.id },
      });

      if (existingVideo) {
        // Delete file from filesystem
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', existingVideo.filePath.replace('/uploads/', 'uploads/'));
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error('Error deleting video file:', err);
        }

        // Delete from database
        await prisma.video.delete({
          where: { projectId: params.id },
        });
      }
    }

    // Handle new screenshot uploads
    const newScreenshots = [];
    if (screenshotFiles.length > 0) {
      const fs = require('fs').promises;
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'screenshots');

      await fs.mkdir(uploadDir, { recursive: true });

      for (const file of screenshotFiles) {
        if (file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = path.join(uploadDir, fileName);

          await fs.writeFile(filePath, buffer);

          newScreenshots.push({
            fileName: file.name,
            filePath: `/uploads/screenshots/${fileName}`,
            fileSize: file.size,
            mimeType: file.type,
          });
        }
      }
    }

    // Handle new video upload
    let newVideo = null;
    if (videoFile && videoFile.size > 0) {
      const fs = require('fs').promises;
      const path = require('path');

      // Delete existing video first if replacing
      const existingVideo = await prisma.video.findUnique({
        where: { projectId: params.id },
      });

      if (existingVideo) {
        const oldFilePath = path.join(process.cwd(), 'public', existingVideo.filePath.replace('/uploads/', 'uploads/'));
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old video file:', err);
        }

        await prisma.video.delete({
          where: { projectId: params.id },
        });
      }

      // Upload new video
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${videoFile.name}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);

      newVideo = {
        fileName: videoFile.name,
        filePath: `/uploads/videos/${fileName}`,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
      };
    }

    // Update project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        projectTitle,
        clientName,
        projectSource,
        projectUrl: projectUrl || null,
        category,
        shortDescription,
        platform,
        status,
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
        screenshots: newScreenshots.length > 0 ? {
          create: newScreenshots,
        } : undefined,
        video: newVideo ? {
          create: newVideo,
        } : undefined,
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

    // Generate embedding for the updated project (async, non-blocking)
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
        console.error('Error generating embedding for updated project:', embeddingError);
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
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Project deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
