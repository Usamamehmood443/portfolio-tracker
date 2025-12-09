import { NextRequest, NextResponse } from 'next/server';
import { uploadToFTP, generateUniqueFilename } from '@/lib/ftp-upload';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'screenshot' or 'video'

    console.log('📁 File:', file?.name, '| Type:', type, '| Size:', file?.size);

    if (!file) {
      console.log('❌ No file provided');
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
    const fileName = generateUniqueFilename(file.name);

    // Determine folder based on type
    const folder = type === 'screenshot' ? 'screenshots' : 'videos';
    const remotePath = `uploads/${folder}/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to FTP
    console.log('🚀 Uploading to FTP:', remotePath);
    const uploadResult = await uploadToFTP(buffer, remotePath);

    if (!uploadResult.success) {
      console.log('❌ FTP upload failed:', uploadResult.error);
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    console.log('✅ FTP upload successful:', uploadResult.url);

    // Return file info
    const fileInfo = {
      fileName,
      filePath: uploadResult.url || '', // Full URL from Hostinger
      fileSize: file.size,
      mimeType: file.type,
    };

    console.log('📤 Returning file info:', fileInfo);

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
