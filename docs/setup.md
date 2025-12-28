# Chapters Development Setup Guide

Complete guide for setting up Chapters backend, web frontend, and mobile app.

---

## Prerequisites

- **Docker Desktop** (for database services)
- **Node.js 18+** and **npm** (for frontend/mobile)
- **Python 3.11+** and **Poetry** (for backend - if running locally)
- **Expo CLI** (for mobile development)

---

## Backend Setup

You have **two options** for running the backend:

### Option A: Backend in Docker (Recommended for Testing)

This runs everything (PostgreSQL, Redis, and Backend API) in Docker containers.

```bash
# Start all services
docker-compose --profile full up

# Or run in detached mode
docker-compose --profile full up -d
```

**Services will be available at:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

**To stop:**
```bash
docker-compose down

# To reset everything (fresh start)
docker-compose down -v
```

---

### Option B: Backend Running Locally (Recommended for Development)

This gives you hot-reload and easier debugging.

#### 1. Start Database Services Only

```bash
docker-compose up -d postgres redis
```

Wait ~10 seconds for services to be healthy:
```bash
docker ps
```

You should see `chapters-postgres` and `chapters-redis` with status "healthy".

#### 2. Install Backend Dependencies

```bash
cd backend

# Install Poetry (if not installed)
pip install poetry

# Install dependencies
poetry install

# Or use pip directly
pip install -r requirements.txt  # if you have one
```

#### 3. Configure Environment

The `backend/.env` file is already set up for local development. Update if needed:

```env
DATABASE_URL=postgresql://chapters:chapters@localhost:5432/chapters
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret-key-change-in-production
OPENAI_API_KEY=sk-your-key-here  # Optional, for Muse AI features
DEBUG=true
```

#### 4. Run Database Migrations

```bash
poetry run alembic upgrade head
```

#### 5. Start Backend API

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Web Frontend Setup

The web frontend is built with Next.js 14 and React.

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `frontend/.env.local` (or use the example):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

**Frontend will be available at:** http://localhost:3000

---

## Mobile App Setup

The mobile app is built with React Native and Expo.

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Install Expo CLI (if not installed)

```bash
npm install -g expo-cli
# Or use npx
npx expo --version
```

### 3. Configure Environment

Update `mobile/.env`:

```env
API_URL=http://localhost:8000
# For testing on physical device, use your computer's IP:
# API_URL=http://192.168.1.XXX:8000
```

### 4. Start Expo Development Server

```bash
npm start
# Or
npx expo start
```

### 5. Run on Device/Simulator

**iOS Simulator:**
```bash
npm run ios
# Or press 'i' in the Expo terminal
```

**Android Emulator:**
```bash
npm run android
# Or press 'a' in the Expo terminal
```

**Physical Device:**
1. Install **Expo Go** app from App Store/Play Store
2. Scan the QR code shown in terminal
3. Make sure your device is on the same WiFi network
4. Update `API_URL` in `.env` to use your computer's local IP

---

## Complete Development Workflow

### Quick Start (All Services)

**Terminal 1 - Backend:**
```bash
# Option A: Docker
docker-compose --profile full up

# Option B: Local
docker-compose up -d postgres redis
cd backend
poetry run uvicorn app.main:app --reload
```

**Terminal 2 - Web Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Mobile App (Optional):**
```bash
cd mobile
npm start
```

---

## Testing the Setup

### 1. Check Backend Health

Visit http://localhost:8000/docs - you should see the Swagger API documentation.

Try the health check endpoint:
```bash
curl http://localhost:8000/health
```

### 2. Test Web Frontend

1. Go to http://localhost:3000
2. Click "Start Your Book" to register
3. Create an account
4. You should be redirected to the Library

### 3. Test Mobile App

1. Open Expo Go on your device
2. Scan the QR code
3. App should load and show the home screen
4. Try registering/logging in

---

## Database Management

### View Database

```bash
# Connect to PostgreSQL
docker exec -it chapters-postgres psql -U chapters -d chapters

# List tables
\dt

# View users
SELECT * FROM users;

# Exit
\q
```

### Reset Database

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres redis

# Run migrations
cd backend
poetry run alembic upgrade head
```

### Create New Migration

```bash
cd backend
poetry run alembic revision --autogenerate -m "description of changes"
poetry run alembic upgrade head
```

---

## Production Deployment (Vercel)

For production deployment, please refer to [docs/deployment.md](docs/deployment.md).

Quick Summary:
- **Backend & Web**: Deployed via Vercel Monorepo (push to main)
- **Mobile**: Deployed via Expo EAS (`eas build`)

---

## Useful Commands

### Backend

```bash
# Run tests
cd backend
poetry run pytest

# Format code
poetry run black .

# Type checking
poetry run mypy .
```

### Frontend

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

### Mobile

```bash
# Clear cache
npx expo start -c

# Run on specific device
npx expo run:ios --device "iPhone 14"
npx expo run:android --device emulator-5554
```

---

## Getting Help

- **Backend Issues**: Check `docker logs chapters-backend` or backend console output
- **Frontend Issues**: Check browser console (F12)
- **Mobile Issues**: Shake device → "Show Dev Menu" → "Debug Remote JS"
- **Database Issues**: Check `docker logs chapters-postgres`

---

## Next Steps

1. ✅ Get all services running
2. ✅ Create a test account
3. ✅ Publish a test chapter
4. ✅ Test on mobile device
5. 🚀 Start building features!

Happy coding! 📖
