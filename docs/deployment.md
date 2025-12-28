# Deployment Guide

## Overview

This guide covers deploying the Chapters platform.
The recommended setup is:
- **Web & Backend**: Vercel Monorepo (using `vercel.json`)
- **Mobile**: Expo EAS
- **Database**: Vercel Postgres or Supabase
- **Redis**: Vercel KV or Upstash
- **Storage**: Cloudflare R2 or AWS S3

## Prerequisites

- Vercel CLI / Account
- Expo CLI / Account
- PostgreSQL 15+ with `pgvector` extension
- Redis 6+
- OpenAI API Key
- S3-compatible storage credentials

---

## 🚀 Option 1: Vercel Monorepo (Recommended)

This project is configured as a monorepo for Vercel, deploying both the Next.js frontend and FastAPI backend in a single project.

### 1. One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnetzkontrast%2Fchapters&env=DATABASE_URL,SECRET_KEY,OPENAI_API_KEY,S3_BUCKET,S3_ACCESS_KEY,S3_SECRET_KEY&project-name=chapters&repository-name=chapters)

Click the button above to clone and deploy to Vercel. You will be prompted for environment variables.

### 2. Manual Vercel Deployment

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link Project: `vercel link`

**Environment Variables:**
Configure these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Database (Vercel Postgres or Supabase)
DATABASE_URL=postgresql://user:password@host:5432/chapters?sslmode=require

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# OpenAI
OPENAI_API_KEY=sk-your-key

# Storage (R2/S3)
S3_BUCKET=chapters-production
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_ENDPOINT_URL=https://<account>.r2.cloudflarestorage.com
S3_REGION=auto

# Frontend
NEXT_PUBLIC_API_URL=https://your-project.vercel.app/api
```

**Deploy:**
```bash
vercel --prod
```

### 3. Database Migrations on Vercel

Since the backend runs as serverless functions, you should run migrations from your local machine or a CI/CD pipeline connecting to the production database.

```bash
# Locally, pointing to production DB
export DATABASE_URL=postgres://user:pass@prod-host:5432/db
cd backend
poetry run alembic upgrade head
```

---

## 📱 Option 2: Mobile Deployment (Expo EAS)

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### 1. Configure Project
```bash
cd mobile
eas build:configure
```

### 2. Set Environment Variables
Create or update `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://your-vercel-project.vercel.app"
      }
    }
  }
}
```

### 3. Build & Submit
```bash
# Build for stores
eas build --platform all --profile production

# Submit
eas submit --platform ios
eas submit --platform android
```

### 4. Over-the-Air Updates
```bash
eas update --branch production
```

---

## 🛠️ Option 3: Docker (Self-Hosted)

If you prefer to host on a VPS or cloud provider (AWS/DigitalOcean/Render) using Docker.

### 1. Production Environment
Create `.env.production`:
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=...
# ... (see .env.example)
```

### 2. Run with Docker Compose
```bash
docker-compose --profile full -f docker-compose.yml up -d
```

### 3. Run Migrations
```bash
docker-compose exec backend alembic upgrade head
```

---

## 🔍 Verification

### Health Check
```bash
curl https://your-project.vercel.app/api/health
# Expected: {"status": "healthy"}
```

### Backend Docs
Visit `https://your-project.vercel.app/docs` to see the Swagger UI.

---

## ⚠️ Important Notes

1. **Vercel Functions**: The backend runs as serverless functions. Long-running background jobs (like `rq` workers) **cannot** run on Vercel functions.
   - **Solution**: Use a separate worker service (e.g., on Railway/Render/Heroku) to run `poetry run rq worker`, connecting to the same Redis and Database.
   - **Alternative**: For MVP, you can use Vercel Cron Jobs to trigger processing endpoints, but true async background processing requires a persistent worker.

2. **Cold Starts**: Serverless functions may have cold starts. Keep the backend lightweight.

3. **Database Connections**: Use a connection pooler (like Supabase Transaction Pooler or Neon) because serverless functions can exhaust database connections quickly.
