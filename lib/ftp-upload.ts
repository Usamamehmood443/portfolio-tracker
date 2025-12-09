import { Client } from 'basic-ftp';
import { Readable } from 'stream';

interface UploadResult {
  success: boolean;
  filePath?: string;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Hostinger via FTP
 * @param buffer - File buffer to upload
 * @param remotePath - Remote path on FTP server (e.g., 'uploads/screenshots/file.jpg')
 * @returns Upload result with file URL
 */
export async function uploadToFTP(
  buffer: Buffer,
  remotePath: string
): Promise<UploadResult> {
  const client = new Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    // Connect to FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: parseInt(process.env.FTP_PORT || '21'),
      secure: false, // Set to true if using FTPS
    });

    // Construct full remote path
    const basePath = process.env.FTP_REMOTE_PATH || '/public_html';
    const fullRemotePath = `${basePath}/${remotePath}`;

    // Ensure directory exists
    const directory = fullRemotePath.substring(0, fullRemotePath.lastIndexOf('/'));
    await client.ensureDir(directory);

    // Convert buffer to stream
    const stream = Readable.from(buffer);

    // Upload file
    await client.uploadFrom(stream, fullRemotePath);

    // Construct public URL
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || '';
    const publicUrl = `${mediaUrl}/${remotePath}`;

    client.close();

    return {
      success: true,
      filePath: remotePath,
      url: publicUrl,
    };
  } catch (error) {
    client.close();
    console.error('FTP upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from Hostinger via FTP
 * @param remotePath - Remote path of file to delete (e.g., 'uploads/screenshots/file.jpg')
 * @returns Success status
 */
export async function deleteFromFTP(remotePath: string): Promise<boolean> {
  const client = new Client();
  client.ftp.verbose = process.env.NODE_ENV === 'development';

  try {
    // Connect to FTP server
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: parseInt(process.env.FTP_PORT || '21'),
      secure: false,
    });

    // Construct full remote path
    const basePath = process.env.FTP_REMOTE_PATH || '/public_html';
    const fullRemotePath = `${basePath}/${remotePath}`;

    // Delete file
    await client.remove(fullRemotePath);

    client.close();
    return true;
  } catch (error) {
    client.close();
    console.error('FTP delete error:', error);
    return false;
  }
}

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original filename
 * @returns Unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '');
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return `${sanitized}-${timestamp}-${random}.${extension}`;
}
