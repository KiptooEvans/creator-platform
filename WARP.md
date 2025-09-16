# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Creator Platform is a production-grade VIPConnect-style content creator platform with comprehensive features for content monetization, user management, and platform administration. This is currently in the **INITIALIZED** state with complete database schema, API specification, and documentation, but the actual backend and frontend implementations are not yet built.

## Development Commands

### Root Level Commands
```powershell
# Start all services (backend + frontend)
npm run dev

# Build all services for production
npm run build

# Run all tests
npm test

# Lint all code and fix issues
npm run lint
npm run lint:fix
```

### Backend Development
```powershell
# Start backend development server with hot reload
cd backend
npm run dev

# Database operations
npm run db:migrate          # Run database migrations
npm run db:migrate:undo     # Undo last migration
npm run db:seed             # Seed database with sample data
npm run db:reset            # Reset database (migrate + seed)

# Testing
npm run test                # Run tests
npm run test:watch          # Run tests in watch mode

# Production
npm run build               # Build for production
npm start                   # Start production server
```

### Frontend Development
```powershell
# Start frontend development server
cd frontend
npm run dev

# Production builds
npm run build               # Build for production
npm start                   # Start production server

# Code quality
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript check
npm test                    # Run tests
```

### Database Setup (First Time)
```powershell
# Create databases
createdb creator_platform_dev
createdb creator_platform_test

# Initialize schema
psql -d creator_platform_dev -f database/schemas/schema.sql
```

## Architecture Overview

### High-Level Structure
This is a **monorepo** with separate backend and frontend applications:

- **Backend**: Node.js/Express API server (not yet implemented)
- **Frontend**: React/Next.js web application (empty directory)
- **Database**: PostgreSQL with comprehensive schema for creator platform
- **File Storage**: AWS S3 + CloudFront CDN integration
- **Payment Processing**: Stripe integration for subscriptions and payments
- **Real-time Features**: WebSocket for messaging and live streaming

### Key Architectural Components

#### Database Schema (PostgreSQL)
The database contains **30+ tables** with complete relationships:

- **User Management**: Multi-role system (fans, creators, admins, moderators) with age verification
- **Content System**: Support for images, videos, audio, text, and live streams with premium monetization
- **Subscription System**: Monthly, yearly, and lifetime subscriptions with flexible pricing
- **Messaging**: One-to-one conversations with premium message support
- **Payment Processing**: Comprehensive transaction logging for all payment types
- **Analytics System**: Content, user, and revenue analytics with geographic tracking
- **Moderation System**: User reporting, automated moderation hooks, and manual review workflows
- **Audit Logging**: Complete system activity tracking for compliance

#### API Structure (100+ endpoints)
The API specification covers:

- **Authentication**: JWT-based auth with refresh tokens
- **Content Management**: CRUD operations for all content types with monetization
- **User Management**: Profile management, following system, age verification
- **Payment Processing**: Subscriptions, tips, pay-per-view content
- **Live Streaming**: Stream management and access control
- **Analytics**: Content performance and revenue analytics
- **Administration**: Comprehensive moderation and admin tools

#### Directory Structure
```
creator-platform/
├── backend/                # API server (directories created, no implementation yet)
│   ├── src/               # Source code
│   ├── config/            # Configuration files
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── frontend/              # Web application (empty directory)
├── database/
│   └── schemas/schema.sql # Complete database schema ✅
├── docs/                  # Comprehensive documentation ✅
│   ├── api-specification.md
│   ├── DATABASE.md
│   └── SETUP.md
└── scripts/               # Build and deployment scripts
```

## Technology Stack

### Backend (Planned)
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 13+ with Redis for caching
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: AWS S3 with CloudFront CDN
- **Payments**: Stripe integration for all payment processing
- **Real-time**: WebSocket for messaging and live streaming
- **Content Moderation**: OpenAI API integration for automated moderation

### Frontend (Planned)
- **Framework**: React with Next.js
- **Styling**: Tailwind CSS (planned)
- **State Management**: Context API + Zustand/Redux
- **Real-time**: WebSocket connections to backend

### Environment Requirements
- **Node.js**: 18.0.0+
- **npm**: 8.0.0+
- **PostgreSQL**: 13+
- **Redis**: 6+ (for caching and sessions)

## Key Features to Understand

### Monetization System
- **Subscription Tiers**: Monthly, yearly, lifetime with creator-set pricing
- **Pay-Per-View**: Individual content pricing
- **Premium Messages**: Paid direct messages with media attachments
- **Tip System**: Anonymous and public tipping with optional messages
- **Live Stream Access**: Paid access to premium live streams

### Content Management
- **Multi-Media Support**: Images, videos, audio, text posts, live streams
- **Visibility Levels**: Public, subscribers-only, premium (pay-per-view)
- **Scheduling**: Content can be scheduled for future publication
- **Content Warnings**: Age restriction and content warning system

### Analytics Capabilities
The platform tracks comprehensive analytics:
- **Content Analytics**: Views, likes, shares, geographic data, device info
- **User Analytics**: Login patterns, profile views, subscription events
- **Revenue Analytics**: Earnings by type, time period, with platform fee calculations

### Security & Compliance
- **Age Verification**: Required document upload system
- **Audit Logging**: All user actions and system changes logged
- **Content Moderation**: Automated detection + manual review workflows
- **GDPR Ready**: User data export and deletion capabilities

## Development Notes

### Current State
- ✅ **Database Schema**: Complete with all relationships and constraints
- ✅ **API Specification**: 100+ endpoints fully documented
- ✅ **Setup Documentation**: Comprehensive development guide
- ⏳ **Backend Implementation**: Directory structure created, no code yet
- ⏳ **Frontend Implementation**: Empty directory, needs setup

### Next Development Steps
1. **Backend API Implementation**: Start with authentication and user management endpoints
2. **Frontend Setup**: Initialize Next.js application with authentication
3. **Database Integration**: Set up ORM/query builder (likely Sequelize or Prisma)
4. **Payment Integration**: Implement Stripe payment processing

### Testing Strategy
- **Unit Tests**: Backend business logic and utilities
- **Integration Tests**: API endpoints with database
- **Frontend Tests**: Component and user interaction testing
- **End-to-End Tests**: Complete user workflows

When working on this codebase, prioritize setting up the backend API implementation first, as the frontend will depend on it. The comprehensive database schema and API specification provide a solid foundation for rapid development.