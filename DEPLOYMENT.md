# 🚀 Portfolio Tracker - Deployment Guide

## Overview
This guide will help you deploy your Portfolio Tracker to production using **FREE** services:
- **Vercel** - Application hosting (FREE)
- **Supabase** - PostgreSQL database (FREE tier: unlimited API requests)
- **Hostinger** - Images/videos storage (your existing hosting)

---

## 📋 Prerequisites

1. GitHub account
2. Vercel account (sign up with GitHub)
3. Supabase account
4. Hostinger FTP credentials

---

## 🗄️ Step 1: Setup Supabase Database (5 minutes)

### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: portfolio-tracker
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
6. Click "Create new project" (takes ~2 minutes)

### 1.2 Get Database Connection String
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to "Connection string"
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password
6. **SAVE THIS STRING** - you'll need it later!

---

## 📁 Step 2: Push Code to GitHub (5 minutes)

### 2.1 Initialize Git Repository
Open terminal in your project folder:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Portfolio Tracker"
```

### 2.2 Create GitHub Repository
1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `portfolio-tracker`
3. Description: "Portfolio management system"
4. Keep it **Private** (recommended)
5. DO NOT initialize with README (we already have one)
6. Click "Create repository"

### 2.3 Push to GitHub
Copy the commands from GitHub (will look like):

```bash
git remote add origin https://github.com/YOUR-USERNAME/portfolio-tracker.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Vercel (5 minutes)

### 3.1 Connect GitHub to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" → Continue with GitHub
3. Authorize Vercel to access your GitHub

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Find your `portfolio-tracker` repository
3. Click "Import"

### 3.3 Configure Build Settings
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 3.4 Add Environment Variables
Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1.2 |
| `NEXT_PUBLIC_APP_URL` | Leave empty for now (will add after deployment) |

### 3.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. Once done, you'll see "Congratulations! 🎉"
4. Click "Visit" to see your live site
5. Copy the URL (e.g., `https://portfolio-tracker-xxx.vercel.app`)

### 3.6 Update App URL
1. Go to your project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_APP_URL`
3. Set it to your Vercel URL (e.g., `https://portfolio-tracker-xxx.vercel.app`)
4. Click "Save"
5. Go to "Deployments" tab → Click "..." → "Redeploy"

---

## 🗃️ Step 4: Setup Database Tables (3 minutes)

### 4.1 Run Prisma Migration
In your local terminal:

```bash
# Install dependencies (if needed)
npm install

# Generate Prisma Client
npx prisma generate

# Push schema to Supabase
npx prisma db push
```

When prompted for DATABASE_URL, use the Supabase connection string.

### 4.2 Seed Initial Data
```bash
# Run seed script
npm run seed
```

This will populate your database with:
- Project sources (Fiverr, Upwork, etc.)
- Categories (Healthcare, E-commerce, etc.)
- Platforms (Wix Studio, WordPress, etc.)
- Statuses (Pending, Completed, etc.)
- Features and Developers
- 5 sample projects

---

## 📸 Step 5: Setup Hostinger for Media Files (10 minutes)

### 5.1 Create Upload Directory
1. Login to your Hostinger cPanel
2. Go to **File Manager**
3. Navigate to `public_html`
4. Create folder structure:
   ```
   public_html/
   └── portfolio-uploads/
       ├── screenshots/
       └── videos/
   ```

### 5.2 Update File Upload API

You need to modify the upload functionality to use Hostinger instead of local storage.

**Option A: Use FTP Upload (Recommended)**

Install FTP library:
```bash
npm install basic-ftp
```

Update `app/api/upload/route.ts` to upload to Hostinger via FTP.

**Option B: Manual Upload**
For now, you can manually upload files to Hostinger and update database paths.

### 5.3 Update File Paths
In your database, file paths should be:
```
https://yourdomain.com/portfolio-uploads/screenshots/filename.jpg
https://yourdomain.com/portfolio-uploads/videos/filename.mp4
```

---

## 🔧 Step 6: Configure Custom Domain (Optional - 5 minutes)

### 6.1 Add Custom Domain to Vercel
1. In Vercel project → Settings → Domains
2. Add your domain (e.g., `portfolio.yourdomain.com`)
3. Vercel will provide DNS records

### 6.2 Update DNS in Hostinger
1. Go to Hostinger DNS settings
2. Add the records provided by Vercel:
   - Type: `CNAME`
   - Name: `portfolio` (or `@` for root)
   - Value: `cname.vercel-dns.com`

Wait 10-30 minutes for DNS propagation.

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Application
Visit your Vercel URL and test:
- [ ] Homepage loads
- [ ] Can view project details
- [ ] Can create new project
- [ ] Can edit project
- [ ] Can delete project
- [ ] All filters work

### 7.2 Check Database Connection
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. You should see all your tables (Project, Feature, Developer, etc.)
4. Check if sample data is present

---

## 🔐 Security Best Practices

### Update .gitignore
Make sure `.env` is in `.gitignore`:
```
.env
.env.local
.env.production
```

### Environment Variables
- ✅ Never commit `.env` file
- ✅ Use Vercel environment variables
- ✅ Use different DATABASE_URL for production and development

---

## 🔄 Continuous Deployment

**Automatic Deployments:**
Every time you push to GitHub main branch:
1. Vercel automatically detects the push
2. Runs build
3. Deploys new version
4. Takes ~2-3 minutes

**To deploy changes:**
```bash
git add .
git commit -m "Your changes description"
git push
```

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Hobby | FREE | 100GB bandwidth/month |
| Supabase | Free Tier | FREE | 500MB database, Unlimited API requests |
| Hostinger | Your existing plan | PAID | Depends on your plan |

**Total: FREE** (assuming you already have Hostinger)

---

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Go to project → Analytics tab
2. Enable Web Analytics (free)
3. See page views, performance metrics

### Supabase Monitoring
1. Go to Supabase project
2. Check "Database" → "Roles & Permissions"
3. Monitor queries and performance

---

## 🆙 Future Scaling Options

When you need more resources:

### Vercel Pro ($20/month)
- Custom domains
- More bandwidth
- Advanced analytics
- Team collaboration

### Supabase Pro ($25/month)
- 8GB database
- Daily backups
- Better performance

### Alternative: Railway ($5-10/month)
- If you need persistent file storage
- Can keep SQLite
- Better for file uploads

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL in Vercel environment variables

### Issue: "Build failed"
**Solution**:
```bash
# Locally test build
npm run build

# Fix any errors shown
```

### Issue: "Images not loading"
**Solution**: Check file paths and Hostinger permissions

### Issue: "500 Internal Server Error"
**Solution**: Check Vercel logs in "Deployments" → Click deployment → "View Function Logs"

---

## 📞 Support

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Success!

Your Portfolio Tracker is now live! 🚀

**Next Steps:**
1. Share the link with your team
2. Start adding real projects
3. Customize branding if needed
4. Setup backups (Supabase has automatic backups)

**Your Live URLs:**
- Application: `https://your-project.vercel.app`
- Database: Supabase Dashboard
- Media: `https://yourdomain.com/portfolio-uploads/`
