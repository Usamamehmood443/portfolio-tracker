# Portfolio Tracker

A full-stack web application for tracking and managing your portfolio projects with detailed information, screenshots, and videos.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Media Storage](#media-storage)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Portfolio Tracker is a modern web application built with Next.js 14 that helps you manage and showcase your project portfolio. It features a beautiful UI, real-time data management, and cloud-based media storage.

**Live Demo**: [https://portfolio-tracker-xi-eight.vercel.app](https://portfolio-tracker-xi-eight.vercel.app)

---

## ✨ Features

### Project Management
- ✅ Create, read, update, and delete projects
- ✅ Rich project details including:
  - Project title, client name, and source
  - Category, platform, and status tracking
  - Budget tracking (proposed and finalized)
  - Duration tracking (estimated and delivered)
  - Start and end dates
  - Project tagline and detailed proposal

### Media Management
- 📸 Multiple screenshot uploads per project
- 🎥 Video upload support
- 🖼️ Image zoom and download functionality
- ☁️ Cloud storage via Hostinger FTP
- 🔗 Direct URL access to all media files

### Advanced Features
- 🏷️ Dynamic tagging system for features and developers
- 🔍 Searchable and filterable project lists
- 📊 Organized dropdown options (project sources, categories, platforms, statuses)
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Built-in theme support
- 📱 Mobile-friendly design

### AI-Powered Search (RAG)
- 🤖 Intelligent semantic search using OpenAI embeddings
- 📋 Paste client job posts to find matching portfolio projects
- 🔄 Automatic embedding generation for new/updated projects
- 📊 AI-generated analysis with match recommendations
- 💡 Similarity scoring to rank project relevance

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Production database (Supabase)
- **SQLite** - Development database option
- **OpenAI API** - Embeddings and chat completions for AI search

### Media Storage
- **Hostinger FTP** - Cloud file storage
- **basic-ftp** - FTP client for Node.js

### Deployment
- **Vercel** - Application hosting (free tier)
- **Supabase** - PostgreSQL database (free tier)
- **Hostinger** - Media file storage

---

## 📁 Project Structure

```
portfolio/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── projects/            # Project CRUD operations
│   │   ├── search/              # AI-powered semantic search
│   │   ├── upload/              # File upload endpoint
│   │   ├── categories/          # Category management
│   │   ├── platforms/           # Platform management
│   │   ├── statuses/            # Status management
│   │   ├── features/            # Feature management
│   │   ├── developers/          # Developer management
│   │   └── project-sources/     # Project source management
│   ├── projects/                # Project pages
│   │   ├── [id]/               # Project detail page
│   │   │   └── edit/           # Project edit page
│   │   └── new/                # New project page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (project list)
│   └── globals.css             # Global styles
├── components/                  # Reusable components
│   ├── ui/                     # UI components from shadcn
│   └── intelligent-search.tsx  # AI-powered search component
├── lib/                        # Utility functions
│   ├── prisma.ts              # Prisma client instance
│   ├── ftp-upload.ts          # FTP upload utilities
│   └── embeddings.ts          # OpenAI embedding utilities
├── scripts/                    # Utility scripts
│   └── generate-embeddings.ts # Generate embeddings for existing projects
├── prisma/                     # Database configuration
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Database seeding script
│   └── seed.ts                # TypeScript seed file
├── public/                     # Static assets
├── .env                        # Environment variables (not committed)
├── .env.example               # Environment template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── DEPLOYMENT.md              # Detailed deployment guide
├── QUICK_DEPLOY.md           # Quick deployment checklist
├── HOSTINGER_SETUP.md        # Hostinger FTP setup guide
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (or use SQLite for local development)
- Hostinger account (for media storage)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Usamamehmood443/portfolio-tracker.git
   cd portfolio-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials (see [Configuration](#configuration))

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # Seed the database with initial data
   npx prisma db seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

#### Database Configuration

For **local development** with SQLite:
```env
DATABASE_URL="file:./dev.db"
```

For **production** with PostgreSQL (Supabase):
```env
# Use pooled connection for runtime (port 6543)
DATABASE_URL="postgresql://user:password@host.supabase.com:6543/postgres?pgbouncer=true"

# Use direct connection for migrations (port 5432)
# Uncomment when running: npx prisma db push
# DATABASE_URL="postgresql://user:password@host.supabase.com:5432/postgres"
```

#### Application URL
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Hostinger FTP Configuration
```env
FTP_HOST="145.79.28.86"                    # Your Hostinger FTP IP or hostname
FTP_USER="your_ftp_username"               # Your FTP username
FTP_PASSWORD="your_ftp_password"           # Your FTP password
FTP_PORT="21"                              # FTP port (usually 21)
FTP_REMOTE_PATH="/public_html/subfolder"   # Remote directory path
NEXT_PUBLIC_MEDIA_URL="https://your-subdomain.yourdomain.com"  # Public media URL
```

### Important Notes:

1. **Database Connections**:
   - For **migrations**: Use direct connection (port 5432, no pgbouncer)
   - For **runtime**: Use pooled connection (port 6543, with pgbouncer)

2. **FTP Credentials**:
   - Get these from Hostinger hPanel → FTP Accounts
   - FTP_HOST can be an IP address or domain name
   - Create folders: `/uploads/screenshots/` and `/uploads/videos/`

3. **Security**:
   - Never commit `.env` to version control
   - `.env` is already in `.gitignore`
   - Use `.env.example` as a template

---

## 🗄️ Database Schema

### Main Models

#### Project
```prisma
model Project {
  id                String    @id @default(cuid())
  projectTitle      String
  clientName        String
  projectSource     String
  projectUrl        String?
  category          String
  shortDescription  String
  platform          String
  status            String    @default("Pending")
  proposedBudget    Float?
  finalizedBudget   Float?
  estimatedDuration String
  deliveredDuration String?
  startDate         DateTime
  endDate           DateTime?
  tagline           String?
  proposal          String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  features          ProjectFeature[]
  developers        ProjectDeveloper[]
  screenshots       Screenshot[]
  video             Video?
}
```

### Related Models

- **Feature**: Reusable project features
- **Developer**: Team members/developers
- **Screenshot**: Project images (stored on Hostinger)
- **Video**: Project video (one per project, stored on Hostinger)
- **ProjectFeature**: Many-to-many junction table
- **ProjectDeveloper**: Many-to-many junction table

### Dropdown Options Models

- **ProjectSource**: Fiverr, Upwork, WhatsApp, etc.
- **Category**: Healthcare, E-commerce, etc.
- **Platform**: Wix, MERN, WordPress, etc.
- **Status**: Pending, Completed, etc.

---

## 🔌 API Routes

All API routes return JSON responses.

### Projects API

- `GET /api/projects` - Fetch all projects
- `GET /api/projects/[id]` - Fetch single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Upload API

- `POST /api/upload` - Upload file to Hostinger
  - FormData: `file` (File), `type` ("screenshot" | "video")
  - Returns: `{ success, data: { fileName, filePath, fileSize, mimeType } }`

### Dropdown APIs

- `GET /api/project-sources`
- `GET /api/categories`
- `GET /api/platforms`
- `GET /api/statuses`
- `GET /api/features`
- `GET /api/developers`

### Search API (AI-Powered)

- `POST /api/search` - Semantic search for projects
  - Body: `{ query: string }` - Natural language query or job post
  - Returns: `{ success, analysis, projects, count, similarityScores }`
  - Requires: `OPENAI_API_KEY` environment variable

---

## 🤖 AI-Powered Search

The portfolio includes an AI-powered semantic search feature that helps match client job posts with relevant portfolio projects.

### Setup

1. **Get an OpenAI API key** from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

2. **Add to environment variables**:
   ```env
   OPENAI_API_KEY=sk-your_api_key_here
   ```

3. **Generate embeddings for existing projects**:
   ```bash
   npx tsx scripts/generate-embeddings.ts
   ```

### How It Works

1. **Embedding Generation**: Each project's content (title, description, features, etc.) is converted to a vector embedding using OpenAI's `text-embedding-3-small` model.

2. **Semantic Search**: When you search, your query is also converted to an embedding, and cosine similarity is calculated against all project embeddings.

3. **AI Analysis**: GPT-4o-mini analyzes the top matches and provides recommendations explaining why each project is relevant.

### Usage

1. Expand the "AI-Powered Search" section on the home page
2. Paste a client job post or describe project requirements
3. Click "Search Portfolio" or press `Ctrl+Enter`
4. Review AI analysis and matching projects with similarity scores

### Auto-Indexing

New projects and project updates automatically generate embeddings when the `OPENAI_API_KEY` is configured.

---

## 🚀 Deployment

### Quick Deployment (Free Tier)

1. **Database**: Supabase (Free - 500MB)
2. **Application**: Vercel (Free - Unlimited)
3. **Media**: Hostinger (Your existing hosting)

### Deployment Guides

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - 30-minute quick start
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive guide
- **[HOSTINGER_SETUP.md](./HOSTINGER_SETUP.md)** - FTP setup

### Environment Variables on Vercel

| Variable | Example Value |
|----------|---------------|
| `DATABASE_URL` | `postgresql://...@host:6543/postgres?pgbouncer=true` |
| `FTP_HOST` | `145.79.28.86` |
| `FTP_USER` | `u123456789.domain.com` |
| `FTP_PASSWORD` | `your_password` |
| `FTP_PORT` | `21` |
| `FTP_REMOTE_PATH` | `/public_html/portfolio-tracker` |
| `NEXT_PUBLIC_MEDIA_URL` | `https://portfolio-tracker.domain.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `OPENAI_API_KEY` | `sk-...` (optional, for AI search) |

---

## 📦 Media Storage

### How It Works

1. User uploads files through the form
2. Files sent to `/api/upload` endpoint
3. Server uploads to Hostinger via FTP
4. Returns public URL: `https://portfolio-tracker.domain.com/uploads/...`
5. URL saved in database
6. Next.js Image component loads from Hostinger

### File Naming

Files renamed on upload:
```
original-name-timestamp-random.ext
```
Example: `homepage-1703289456123-x7f9k2.png`

### Supported Files

**Screenshots**: JPEG, PNG, GIF, WebP (Max 10MB)
**Videos**: MP4, WebM, MOV (Max 50MB)

---

## 🐛 Troubleshooting

### "Failed to fetch projects"
- Check DATABASE_URL in `.env`
- Use **pooled connection** (port 6543) for runtime
- Use **direct connection** (port 5432) only for migrations

### "FTP upload failed: ENOTFOUND"
- Verify FTP_HOST (use IP address if hostname fails)
- Test with: `node test-ftp.js`

### "MaxClientsInSessionMode"
- Switch to pooled connection (port 6543 with pgbouncer)

### Next.js Image Error
- Add domain to `next.config.mjs`:
  ```javascript
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'your-media-domain.com',
      pathname: '/uploads/**',
    }],
  }
  ```

### Empty Dropdowns
- Run: `npx prisma db seed`
- Check API responses in browser console

---

## 📝 Development Notes

### Database Migrations

```bash
# Switch to direct connection in .env
npx prisma db push
# Switch back to pooled connection
```

### Testing FTP

```bash
node test-ftp.js
```

### Adding New Features

1. Update Prisma schema
2. Run `npx prisma db push`
3. Update API routes
4. Update UI components

---

## 🤝 Contributing

This is a personal project. Suggestions welcome!

---

## 📄 License

Private and proprietary.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Vercel](https://vercel.com/)
- [Supabase](https://supabase.com/)
- [Hostinger](https://www.hostinger.com/)

---

**Last Updated**: December 2024
**Version**: 1.0.0
