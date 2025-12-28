# 🤖 AGENTS.md - Context Map & Navigation Guide

> **STOP & READ**: This file is optimized for AI agents to quickly understand the codebase structure, constraints, and operational procedures without reading 20+ documentation files.

## 🌍 System Context
**Chapters** is a "Slow Social" platform.
- **Core Philosophy**: Finite by design, intentional publishing, privacy-first, calm engagement.
- **Key Constraints**:
  - 🚫 **No Infinite Scroll**: Feeds are paginated/bounded.
  - 🚫 **No Viral Mechanics**: No trending lists, public like counts are subtle.
  - 🔒 **Privacy Default**: Drafts/Notes are private. Books can be private.
  - ⏳ **Open Pages**: Users get max 3 "Open Pages" (publish tokens). 1 granted/day.

## 🗺️ Territory Map

### 🔧 Backend (`backend/app`)
*FastAPI, SQLAlchemy (Async), PostgreSQL + pgvector, Redis*

| Concept | Location | Key Files |
|---------|----------|-----------|
| **Models** | `backend/app/models/` | `user.py`, `book.py`, `chapter.py` (Centralized definitions) |
| **Auth** | `backend/app/auth/` | `service.py` (JWT logic), `router.py` (Endpoints) |
| **Publishing** | `backend/app/chapters/` | `service.py` (Validation of 12 blocks max, Open Page consumption) |
| **Drafts/Notes** | `backend/app/study/` | `service.py` (Private drafts, note nook) |
| **Feeds** | `backend/app/library/` | `service.py` (Bounded feed logic, Quiet Picks algorithm) |
| **Social** | `backend/app/engagement/` | `service.py` (Hearts, Follows), `backend/app/btl/` (Between the Lines) |
| **AI (Muse)** | `backend/app/muse/` | `service.py` (OpenAI calls, Prompt generation - **Check for rate limits here**) |
| **Config** | `backend/app/` | `config.py` (Env vars), `database.py` (DB connection) |

### 🖥️ Frontend Web (`frontend/src`)
*Next.js 14 (App Router), Tailwind, shadcn/ui*

| Component | Location | Notes |
|-----------|----------|-------|
| **Pages** | `src/app/` | Folder structure matches URL routes. |
| **API Clients** | `src/services/` | Typed wrappers around fetch. Check here before making raw API calls. |
| **Components** | `src/components/` | `library/` (Feed), `study/` (Editor), `muse/` (AI UI). |
| **Hooks** | `src/hooks/` | `useMuse.ts`, `useLibrary.ts` (React Query wrappers). |

### 📱 Mobile (`mobile/src`)
*React Native, Expo, Reanimated 3*

| Component | Location | Notes |
|-----------|----------|-------|
| **Screens** | `src/app/` | Expo Router file-based navigation. |
| **State** | `src/store/` | Zustand stores (`authStore.ts`). |
| **Reader** | `components/reader/` | **Critical**: Contains Page-Turn animation logic (`ChapterBlock.tsx`). |
| **Composer** | `components/composer/` | Mobile editor implementation. |

## 🚦 Decision Guide: "Where do I look?"

1. **"I need to change how Chapters are published."**
   - Backend: `backend/app/chapters/service.py` (Logic), `router.py` (Endpoint).
   - Validation: Check `backend/app/services/open_pages.py` for token consumption.
   - Frontend: `frontend/src/components/study/ChapterComposer.tsx`.

2. **"I need to fix a database migration."**
   - Check `backend/alembic/versions/`.
   - **Rule**: Never edit existing migrations. Create a new one with `alembic revision --autogenerate`.

3. **"I need to debug AI responses."**
   - Backend: `backend/app/muse/prompts.py` (Prompt templates).
   - Backend: `backend/app/muse/service.py` (OpenAI integration).

## 🛠️ Operational Cheatsheet

### Backend
```bash
# Prerequisites: Ensure Postgres & Redis are running and .env is set (see .env.example)

# Run Tests (Fast execution)
cd backend && poetry run pytest

# Run Tests (Full property tests - slow)
cd backend && poetry run pytest tests/properties/

# Database Migrations
cd backend && poetry run alembic upgrade head
```

### Frontend
```bash
# Run Dev Server
cd frontend && npm run dev

# Linting
cd frontend && npm run lint
```

### Mobile
```bash
# Start Expo
cd mobile && npm start
```

## ⚠️ Common Pitfalls for Agents
1. **Do NOT assume standard social media features.** If you are asked to add "infinite scroll" or "public like counts", **refuse** and cite `docs/vision.md`.
2. **Do NOT put logic in Routers.** Keep `router.py` files thin. Business logic goes to `service.py`.
3. **Respect the "Open Page" Economy.** Publishing *must* consume a token.
4. **Muse is Opt-In.** AI never acts without user initiation.
