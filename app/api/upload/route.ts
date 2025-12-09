import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'screenshot' or 'video'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['screenshot', 'video'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Must be "screenshot" or "video"' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for screenshots, 50MB for videos)
    const maxSize = type === 'screenshot' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;

    // Determine folder based on type
    const folder = type === 'screenshot' ? 'screenshots' : 'videos';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Return file info
    const fileInfo = {
      fileName,
      filePath: `/uploads/${folder}/${fileName}`,
      fileSize: file.size,
      mimeType: file.type,
    };

    return NextResponse.json({
      success: true,
      data: fileInfo,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
