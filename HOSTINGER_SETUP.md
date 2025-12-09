# Hostinger Media Storage Setup Guide

This guide will help you configure Hostinger for storing project images and videos.

---

## Step 1: Get FTP Credentials from Hostinger

1. **Log in to Hostinger Control Panel** (hPanel)
2. Go to **"FTP Accounts"** in the sidebar
3. You'll see your existing FTP account or can create a new one:
   - Click **"Create FTP Account"** (optional - if you want a dedicated account)
   - Or use the main FTP account that came with your hosting

4. **Copy these details**:
   - **Hostname**: Usually `ftp.yourdomain.com` or `ftp.techvertics.com`
   - **Username**: Your FTP username (e.g., `u123456789` or `portfolio@techvertics.com`)
   - **Password**: Your FTP password
   - **Port**: Usually `21` (standard FTP)

---

## Step 2: Create Folder Structure

1. In hPanel, go to **"File Manager"**
2. Navigate to your subdomain folder:
   - Usually: `public_html/portfolio-tracker` or similar
   - If it's in root: `public_html/`

3. Create these folders:
   ```
   public_html/portfolio-tracker/
   ├── uploads/
   │   ├── screenshots/
   │   └── videos/
   └── (other files)
   ```

4. **Set permissions** (if needed):
   - Right-click each folder → Permissions
   - Set to `755` (read, write, execute for owner)

---

## Step 3: Configure .env File

Update your `.env` file with the FTP credentials:

```env
# Hostinger FTP Configuration
FTP_HOST="ftp.techvertics.com"
FTP_USER="your_ftp_username_here"
FTP_PASSWORD="your_ftp_password_here"
FTP_PORT="21"
FTP_REMOTE_PATH="/public_html/portfolio-tracker"
NEXT_PUBLIC_MEDIA_URL="https://portfolio-tracker.techvertics.com"
```

**Important**:
- Replace `your_ftp_username_here` with your actual FTP username
- Replace `your_ftp_password_here` with your actual FTP password
- Adjust `FTP_REMOTE_PATH` to match your subdomain folder path
- `NEXT_PUBLIC_MEDIA_URL` should be your subdomain URL

---

## Step 4: Configure Vercel Environment Variables

Since you're deploying on Vercel, add these environment variables:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these variables (one by one):

   | Variable Name | Value | Environments |
   |--------------|-------|--------------|
   | `FTP_HOST` | `ftp.techvertics.com` | Production, Preview |
   | `FTP_USER` | `your_username` | Production, Preview |
   | `FTP_PASSWORD` | `your_password` | Production, Preview |
   | `FTP_PORT` | `21` | Production, Preview |
   | `FTP_REMOTE_PATH` | `/public_html/portfolio-tracker` | Production, Preview |
   | `NEXT_PUBLIC_MEDIA_URL` | `https://portfolio-tracker.techvertics.com` | Production, Preview |

3. **Redeploy** your application after adding variables

---

## Step 5: Test the Setup

### Local Testing:

1. Make sure your `.env` file has correct FTP credentials
2. Run your development server:
   ```bash
   npm run dev
   ```
3. Try uploading an image or video from the "Add Project" page
4. Check if the file appears in your Hostinger File Manager under `uploads/screenshots/` or `uploads/videos/`

### Production Testing:

1. After deploying to Vercel with environment variables
2. Visit your Vercel URL
3. Try uploading a test image
4. Verify it appears on Hostinger

---

## Common Issues & Solutions

### Issue 1: "FTP connection failed"
**Solution**:
- Double-check FTP credentials
- Verify FTP port (usually 21)
- Check if Hostinger's firewall allows FTP connections
- Try using IP address instead of domain name for `FTP_HOST`

### Issue 2: "Directory not found"
**Solution**:
- Check `FTP_REMOTE_PATH` in .env
- Use File Manager to verify exact path
- Common paths:
  - `/public_html/portfolio-tracker`
  - `/public_html/`
  - `/domains/yourdomain.com/public_html/`

### Issue 3: "Permission denied"
**Solution**:
- Check folder permissions (should be 755)
- Verify FTP user has write access to the directory
- Try creating folders manually via File Manager first

### Issue 4: Images not loading on website
**Solution**:
- Verify `NEXT_PUBLIC_MEDIA_URL` is correct
- Check if files exist in File Manager
- Ensure folders are publicly accessible
- Test URL directly: `https://portfolio-tracker.techvertics.com/uploads/screenshots/test.jpg`

---

## File Paths Explained

When you upload a file:

1. **File is uploaded to**: `FTP_REMOTE_PATH + /uploads/screenshots/filename.jpg`
   - Example: `/public_html/portfolio-tracker/uploads/screenshots/project-1234567890-abc123.jpg`

2. **File is accessible at**: `NEXT_PUBLIC_MEDIA_URL + /uploads/screenshots/filename.jpg`
   - Example: `https://portfolio-tracker.techvertics.com/uploads/screenshots/project-1234567890-abc123.jpg`

3. **Database stores**: Full public URL
   - Example: `https://portfolio-tracker.techvertics.com/uploads/screenshots/project-1234567890-abc123.jpg`

---

## Security Tips

1. **Never commit FTP credentials** to Git (already in .gitignore)
2. **Use strong FTP passwords**
3. **Consider creating a dedicated FTP user** with limited access
4. **Regularly backup** your uploads folder
5. **Monitor disk space** on Hostinger

---

## Next Steps After Setup

1. Update existing projects to use Hostinger URLs (if any)
2. Test upload functionality thoroughly
3. Monitor upload logs for errors
4. Set up automated backups (optional)

---

## Need Help?

If you encounter issues:
1. Check Vercel function logs for error messages
2. Check Hostinger FTP logs (if available)
3. Verify all environment variables are set correctly
4. Test FTP connection using an FTP client (FileZilla) first

---

**Done!** Your portfolio tracker now stores all media files on Hostinger!
