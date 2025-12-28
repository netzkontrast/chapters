# Implementation Plan: Chapters MVP

## Overview

This implementation plan breaks down the Chapters MVP into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests integrated throughout to catch errors early. The plan follows a backend-first approach, establishing core functionality before building client applications.

The implementation uses:
- **Backend**: Python 3.11+ with FastAPI, SQLAlchemy, PostgreSQL with pgvector
- **Mobile**: React Native with Expo, TypeScript
- **Web**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Deployment**: Vercel Monorepo (Web + Backend), Expo EAS (Mobile)

## Tasks

- [x] 1. Project Setup and Infrastructure
  - Initialize backend FastAPI project with Poetry for dependency management
  - Set up PostgreSQL database with pgvector extension
  - Configure Redis for caching and job queue
  - Set up Alembic for database migrations
  - Configure S3-compatible storage (Cloudflare R2 or AWS S3)
  - Set up environment configuration and secrets management
  - Configure Sentry for error tracking
  - _Requirements: 21.1, 21.3, 22.1, 22.2, 24.1, 24.4, 24.5_

- [x] 2. Core Database Models and Migrations
  - [x] 2.1 Create User and Book models
    - Define User model with email, username, password_hash, open_pages, last_open_page_grant
    - Define Book model with one-to-one relationship to User
    - Create Alembic migration for users and books tables
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 2.3 Create Chapter and ChapterBlock models
    - Define Chapter model with metadata fields (title, mood, theme, cover_url, published_at, edit_window_expires)
    - Define ChapterBlock model with block_type enum and jsonb content
    - Create Alembic migration for chapters and chapter_blocks tables
    - Add foreign key constraints and indexes
    - _Requirements: 2.1, 2.2, 2.8, 2.9_

  - [x] 2.4 Create Study models (Draft, DraftBlock, Note, Footnote)
    - Define Draft and DraftBlock models similar to Chapter structure
    - Define Note model with tags array and voice_memo_url
    - Define Footnote model with draft/chapter references and text_range jsonb
    - Create Alembic migration
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.5 Create Engagement models (Follow, Heart, Bookmark)
    - Define Follow model with unique constraint on (follower_id, followed_id)
    - Define Heart model with unique constraint on (user_id, chapter_id)
    - Define Bookmark model with unique constraint on (user_id, chapter_id)
    - Create Alembic migration with indexes
    - _Requirements: 8.1, 8.2, 9.1_

  - [x] 2.6 Create Margin model
    - Define Margin model with chapter and optional block references
    - Create Alembic migration
    - _Requirements: 7.1, 7.2_

  - [x] 2.7 Create Between the Lines models
    - Define BetweenTheLinesThread model with participants and status
    - Define BetweenTheLinesInvite model with sender, recipient, note, status
    - Define BetweenTheLinesMessage model
    - Define BetweenTheLinesPin model
    - Create Alembic migration with constraints
    - _Requirements: 12.1, 12.3, 12.5, 12.6, 12.7_

  - [x] 2.8 Create Moderation models (Block, Report)
    - Define Block model with unique constraint on (blocker_id, blocked_id)
    - Define Report model with status enum
    - Create Alembic migration
    - _Requirements: 13.1, 13.2, 14.1_

  - [x] 2.9 Create Embedding models (ChapterEmbedding, UserTasteProfile)
    - Define ChapterEmbedding model with vector(1536) type using pgvector
    - Define UserTasteProfile model with vector(1536) type
    - Create Alembic migration with HNSW indexes for similarity search
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 3. Authentication System
  - [x] 3.1 Implement JWT token generation and validation
    - Create token service with access token (15min) and refresh token (7 day) generation
    - Implement token validation middleware
    - Add token blacklist support using Redis
    - _Requirements: 1.5, 23.2_

  - [x] 3.3 Implement user registration endpoint
    - Create POST /auth/register endpoint
    - Validate email format and username uniqueness
    - Hash password using bcrypt
    - Create User and associated Book automatically
    - Initialize with 3 Open Pages
    - Return access and refresh tokens
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.5 Implement login and token refresh endpoints
    - Create POST /auth/login endpoint with email/password
    - Create POST /auth/refresh endpoint for token renewal
    - Create POST /auth/logout endpoint to blacklist tokens
    - _Requirements: 1.5_

- [x] 4. Open Pages System
  - [x] 4.1 Implement Open Pages business logic
    - Create service function to check available Open Pages
    - Create service function to consume Open Page on publish
    - Create service function to grant daily Open Page
    - Add validation to prevent publishing without Open Pages
    - _Requirements: 2.5, 2.6, 3.1, 3.2, 3.3, 3.4_

  - [x] 4.3 Create background job for daily Open Page grants
    - Implement RQ job to grant Open Pages to eligible users
    - Schedule job to run daily at midnight UTC
    - Add job monitoring and error handling
    - _Requirements: 3.1, 17.4_

- [x] 5. Chapter Management
  - [x] 5.1 Implement chapter creation endpoint
    - Create POST /chapters endpoint
    - Validate block count (max 12 total, max 2 media)
    - Validate media durations (audio ≤5min, video ≤3min)
    - Check and consume Open Page
    - Set edit_window_expires to 30 minutes from now
    - Queue cover generation job
    - Queue embedding generation job
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.10_

  - [x] 5.3 Implement chapter retrieval endpoints
    - Create GET /chapters/{chapter_id} endpoint
    - Ensure margins are NOT included in response
    - Check access permissions based on Book privacy
    - Return chapter with blocks ordered by position
    - _Requirements: 6.5, 15.1, 15.2_

  - [x] 5.5 Implement chapter update endpoint
    - Create PATCH /chapters/{chapter_id} endpoint
    - Check edit window (must be within 30 minutes)
    - Allow updating title, mood, theme, and blocks
    - Validate block constraints
    - _Requirements: 2.10_

  - [x] 5.7 Implement chapter deletion endpoint
    - Create DELETE /chapters/{chapter_id} endpoint
    - Soft delete or hard delete based on requirements
    - Remove associated data (hearts, bookmarks, margins)
    - _Requirements: 23.6_

- [x] 6. Checkpoint - Core Chapter Functionality
  - Ensure all tests pass
  - Verify chapter creation, retrieval, update, and deletion work correctly
  - Verify Open Pages are consumed and granted properly

- [x] 7. Study (Drafts and Notes)
  - [x] 7.1 Implement draft management endpoints
    - Create POST /study/drafts endpoint
    - Create GET /study/drafts endpoint (list user's drafts)
    - Create GET /study/drafts/{draft_id} endpoint
    - Create PATCH /study/drafts/{draft_id} endpoint
    - Create DELETE /study/drafts/{draft_id} endpoint
    - Ensure all drafts are private by default
    - _Requirements: 4.1, 4.2_

  - [x] 7.3 Implement draft promotion endpoint
    - Create POST /study/drafts/{draft_id}/promote endpoint
    - Convert draft blocks to chapter blocks
    - Check and consume Open Page
    - Create chapter with same content structure
    - Queue cover and embedding generation
    - _Requirements: 4.5_

  - [x] 7.5 Implement note management endpoints
    - Create POST /study/notes endpoint
    - Create GET /study/notes endpoint (list user's notes)
    - Create PATCH /study/notes/{note_id} endpoint
    - Create DELETE /study/notes/{note_id} endpoint
    - Support tags array and voice_memo_url
    - _Requirements: 4.3_

- [x] 8. Engagement (Hearts, Follows, Bookmarks)
  - [x] 8.1 Implement heart endpoints
    - Create POST /chapters/{chapter_id}/heart endpoint
    - Create DELETE /chapters/{chapter_id}/heart endpoint
    - Increment/decrement chapter heart_count
    - Prevent duplicate hearts with unique constraint
    - _Requirements: 8.1_

  - [x] 8.3 Implement follow endpoints
    - Create POST /books/{book_id}/follow endpoint
    - Create DELETE /books/{book_id}/follow endpoint
    - Create GET /books/{book_id}/followers endpoint
    - Create GET /books/{book_id}/following endpoint
    - Prevent self-follows
    - _Requirements: 8.2_

  - [x] 8.5 Implement bookmark endpoints
    - Create POST /chapters/{chapter_id}/bookmark endpoint
    - Create DELETE /bookmarks/{bookmark_id} endpoint
    - Create GET /bookmarks endpoint (list user's bookmarks, chronological order)
    - Allow bookmarking chapters from unfollowed Books
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 8.7 Ensure engagement metrics in API responses
    - Add heart_count and follower_count to Book serializers
    - Add heart_count to Chapter serializers
    - _Requirements: 8.3_

- [x] 9. Margins (Comments)
  - [x] 9.1 Implement margin endpoints
    - Create POST /chapters/{chapter_id}/margins endpoint
    - Create GET /chapters/{chapter_id}/margins endpoint (separate from chapter)
    - Create DELETE /margins/{margin_id} endpoint
    - Support optional block_id for specific block comments
    - Implement rate limiting (20 per hour)
    - _Requirements: 7.1, 7.2, 7.4, 18.1_

- [x] 10. Checkpoint - Engagement Features
  - Ensure all tests pass
  - Verify hearts, follows, bookmarks, and margins work correctly
  - Verify rate limiting is enforced

- [x] 11. Library and Feed System
  - [x] 11.1 Implement bookshelf (spines) endpoint
    - Create GET /library/spines endpoint
    - Return all followed Books with unread indicators
    - Calculate unread_count based on chapters published after user's last read
    - Include last_chapter_at timestamp
    - _Requirements: 5.1, 5.2_

  - [x] 11.3 Implement new chapters feed endpoint
    - Create GET /library/new endpoint with pagination
    - Return recent chapters from followed Books
    - Enforce bounded results (max 100 total, paginated)
    - Include pagination metadata (page, total_pages, has_more)
    - No infinite scroll support
    - _Requirements: 5.3_

  - [x] 11.5 Implement Book chapters endpoint
    - Create GET /books/{book_id}/chapters endpoint
    - Return chapters in page-based format
    - Support pagination for browsing
    - Check access permissions
    - _Requirements: 5.4, 15.1, 15.2_

- [x] 12. Muse AI Service - Core Setup
  - [x] 12.1 Create Muse service module
    - Set up OpenAI client configuration
    - Create MuseService class with dependency injection
    - Implement rate limiting for Muse operations using Redis
    - Configure rate limits: 10 prompts/hour, 15 rewrites/hour, 5 covers/day
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 18.3_

  - [x] 12.3 Implement prompt generation
    - Create POST /muse/prompts endpoint
    - Call OpenAI GPT-4 with user context and notes
    - Return list of writing prompts
    - _Requirements: 10.1_

  - [x] 12.5 Implement title suggestions
    - Create POST /muse/title-suggestions endpoint
    - Accept draft content as input
    - Call OpenAI GPT-4 to generate title options
    - Return list of suggested titles
    - _Requirements: 10.2_

  - [x] 12.7 Implement text rewriting
    - Create POST /muse/rewrite endpoint
    - Accept text and style constraints
    - Call OpenAI GPT-4 with instructions to preserve voice
    - Return rewritten text
    - _Requirements: 10.3_

  - [x] 12.9 Verify Muse doesn't auto-publish
    - Ensure all Muse endpoints only return suggestions
    - Verify no Muse operation creates published chapters
    - _Requirements: 10.5_

- [x] 13. Muse AI Service - Embeddings and Taste
  - [x] 13.1 Implement embedding generation
    - Create function to generate embeddings using OpenAI text-embedding-3-small
    - Extract text from chapter for embedding (title + mood + theme + text blocks)
    - Store embeddings in ChapterEmbedding table
    - _Requirements: 11.1_

  - [x] 13.3 Implement taste profile initialization
    - Create POST /muse/onboarding endpoint
    - Conduct taste conversation with user
    - Generate initial taste embedding
    - Create UserTasteProfile record
    - _Requirements: 10.7, 11.2_

  - [x] 13.5 Implement taste profile updates
    - Create background job to update taste on interactions
    - Weight interactions: read=0.3, heart=0.6, bookmark=1.0
    - Update taste as weighted average with chapter embedding
    - Update UserTasteProfile.updated_at timestamp
    - _Requirements: 11.2_

  - [x] 13.7 Implement Quiet Picks algorithm
    - Create GET /library/quiet-picks endpoint
    - Query chapters from followed Books (last 7 days, unread)
    - Calculate cosine similarity with user taste embedding
    - Return top 5 by similarity (max 2 per Book for diversity)
    - Ensure no correlation with heart_count (taste-based, not popularity)
    - _Requirements: 5.5, 5.6, 11.4_

  - [x] 13.9 Implement resonance calculation
    - Create function to calculate resonance between two users
    - Use cosine similarity between taste embeddings
    - Return resonance score (0-1)
    - _Requirements: 11.5_

- [x] 15. Checkpoint - Muse Integration
  - Ensure all tests pass
  - Verify prompts, titles, rewrites work correctly
  - Verify embeddings are generated and stored
  - Verify Quiet Picks use taste-based selection

- [x] 16. Between the Lines - Eligibility and Invites
  - [x] 16.1 Implement eligibility check function
    - Create service function to check BTL eligibility
    - Verify mutual follow relationship
    - Verify both users have 3+ published chapters
    - Verify no block relationship exists
    - Verify rate limit not exceeded (3 invites/day)
    - _Requirements: 12.1, 12.2, 13.1, 13.3_

  - [x] 16.3 Implement invite endpoints
    - Create POST /between-the-lines/invites endpoint
    - Validate eligibility before creating invite
    - Require note or quoted_line in request
    - Create BetweenTheLinesInvite record with status='pending'
    - Enforce rate limiting
    - _Requirements: 12.3, 13.3, 18.2_

  - [x] 16.5 Implement invite response endpoints
    - Create GET /between-the-lines/invites endpoint (list pending)
    - Create POST /between-the-lines/invites/{invite_id}/accept endpoint
    - Create POST /between-the-lines/invites/{invite_id}/decline endpoint
    - On accept: create BetweenTheLinesThread with status='open'
    - Update invite status accordingly
    - _Requirements: 12.4, 12.5_

- [x] 17. Between the Lines - Messaging
  - [x] 17.1 Implement thread endpoints
    - Create GET /between-the-lines/threads endpoint (list user's threads)
    - Create GET /between-the-lines/threads/{thread_id} endpoint (get messages)
    - Verify user is a participant before granting access
    - _Requirements: 12.6_

  - [x] 17.2 Implement message endpoints
    - Create POST /between-the-lines/threads/{thread_id}/messages endpoint
    - Verify thread is open (status='open')
    - Verify user is a participant
    - Create BetweenTheLinesMessage record
    - _Requirements: 12.6, 12.8_

  - [x] 17.4 Implement thread closure endpoint
    - Create POST /between-the-lines/threads/{thread_id}/close endpoint
    - Verify user is a participant
    - Update thread status to 'closed'
    - Set closed_at timestamp
    - _Requirements: 12.8, 13.4_

  - [x] 17.5 Implement pin endpoints
    - Create POST /between-the-lines/threads/{thread_id}/pin endpoint
    - Accept chapter_id and excerpt text
    - Create BetweenTheLinesPin record
    - _Requirements: 12.7_

- [x] 18. Moderation and Safety
  - [x] 18.1 Implement block endpoints
    - Create POST /moderation/blocks endpoint
    - Create DELETE /moderation/blocks/{user_id} endpoint (unblock)
    - Create GET /moderation/blocks endpoint (list blocked users)
    - On block: remove follow relationships in both directions
    - On block: prevent access to blocker's Book and chapters
    - On block: prevent margin creation on blocker's chapters
    - _Requirements: 13.1, 14.1, 14.2, 14.3_

  - [x] 18.3 Implement report endpoints
    - Create POST /moderation/reports endpoint
    - Accept reported_user_id or reported_chapter_id
    - Require reason and details
    - Create Report record with status='pending'
    - _Requirements: 13.2, 14.4_

- [x] 19. Privacy and Access Control
  - [x] 19.1 Implement Book privacy settings
    - Add endpoint to update Book.is_private
    - Create access control middleware
    - Private Books: only owner and followers can access
    - Public Books: any authenticated user can access
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 20. Media Upload and Storage
  - [x] 20.1 Implement media upload service
  - [x] 20.3 Implement media upload endpoints

- [x] 21. Background Jobs and Workers
  - [x] 21.1 Set up background task processing
  - [x] 21.3 Implement embedding generation job
  - [x] 21.4 Implement taste update job

- [x] 22. Database Constraints and Integrity
  - [x] 22.1 Add foreign key constraints to all models

- [x] 23. API Error Handling and Logging
  - [x] 23.1 Implement global error handlers
  - [x] 23.2 Set up structured logging

- [x] 24. Checkpoint - Backend Complete
  - Ensure all backend tests pass ✅
  - Verify all API endpoints work correctly ✅
  - 9/9 test suites passing
  - 70+ tests passing

- [x] 25. Mobile App - Project Setup
  - [x] 25.1 Initialize React Native project with Expo
  - [x] 25.2 Set up API client
  - [x] 25.3 Set up state management

- [x] 26. Mobile App - Authentication Screens
  - [x] 26.1 Create login screen
  - [x] 26.2 Create registration screen
  - [x] 26.3 Create Muse onboarding screen

- [x] 27. Mobile App - Library (Bookshelf)
  - [x] 27.1 Create Library screen with bookshelf UI
  - [x] 27.2 Create New Chapters view
  - [x] 27.3 Create Quiet Picks view

- [x] 28. Mobile App - Chapter Reader
  - [x] 28.1 Create Chapter Reader screen with page-turn
  - [x] 28.2 Implement Margins drawer
  - [x] 28.3 Add engagement actions

- [x] 29. Mobile App - Study (Drafts)
  - [x] 29.1 Create Drafts list screen
  - [x] 29.2 Create Draft Editor screen
  - [x] 29.3 Create Note Nook screen
  - [x] 29.4 Implement draft promotion

- [x] 30. Mobile App - Composer and Muse
  - [x] 30.1 Create Chapter Composer screen
  - [x] 30.2 Integrate Muse in composer

- [x] 31. Mobile App - Between the Lines
  - [x] 31.1 Create BTL Invites screen
  - [x] 31.2 Create BTL Threads list screen
  - [x] 31.3 Create BTL Thread screen
  - [x] 31.4 Create BTL Invite flow

- [x] 32. Mobile App - Profile and Settings
  - [x] 32.1 Create Book (Profile) screen
  - [x] 32.2 Create Settings screen

- [x] 33. Checkpoint - Mobile App Core Features
  - Ensure mobile app builds and runs ✅
  - All features verified and documented ✅

- [x] 34. Web App - Project Setup
  - [x] 34.1 Initialize Next.js project
  - [x] 34.2 Set up API client
  - [x] 34.3 Install shadcn/ui components

- [x] 35. Web App - Marketing Pages
  - [x] 35.1 Create landing page
  - [x] 35.2 Create manifesto page
  - [x] 35.3 Create about page

- [x] 36. Web App - Authentication Pages
  - [x] 36.1 Create login page
  - [x] 36.2 Create registration page

- [x] 37. Web App - Reading Experience
  - [x] 37.1 Create Library page
  - [x] 37.2 Create Book page
  - [x] 37.3 Create Chapter reader page

- [x] 38. Web App - Limited Interaction
  - [x] 38.1 Implement read-only Study view
  - [x] 38.2 Add engagement actions

- [x] 39. Deployment and Infrastructure
  - [x] 39.1 Configure Vercel Monorepo (Backend + Web)
    - Configure `vercel.json` for Python + Next.js support
    - Set up serverless entry point at `backend/api/index.py`
    - Configure environment variables
    - _Requirements: 24.1, 24.2_

  - [x] 39.2 Configure S3 storage
    - Set up Cloudflare R2 bucket or AWS S3
    - Configure CORS for uploads
    - _Requirements: 24.4_

  - [x] 39.3 Configure mobile app builds with Expo EAS
    - Set up Expo EAS account
    - Configure build profiles for iOS and Android
    - _Requirements: 24.3_

- [x] 40. Final Integration Testing
  - [x] 40.3 Manual testing of critical paths
    - Test user registration and onboarding
    - Test chapter creation and publishing
    - Test reading experience on mobile
    - Test Between the Lines invitation and messaging

- [x] 41. Final Checkpoint
  - Ensure all tests pass
  - Verify all features work in deployed environments
  - Verify calm, intentional UX is preserved

## Notes

- **Status: Complete** - All planned tasks for MVP have been implemented.
- The project supports full Vercel deployment for backend and frontend.
- Mobile app is ready for EAS build and submission.
