# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GrabHealth AI is a comprehensive wellness ecosystem with integrated multi-level marketing (MLM) capabilities, built as a Turborepo monorepo. The platform combines traditional Chinese medicine (TCM) with modern technology to provide health products and services through e-commerce, MLM network marketing, AI-powered diagnostics, and blockchain technology.

### Company Mission & Vision
- **Wellness Focus**: Providing free medical checkups and health services
- **AI Integration**: AI-powered patient database and product recommendations
- **Modern TCM**: Integrating traditional Chinese medicine with modern technology
- **Blockchain**: Implementing blockchain for health ecosystem transparency

### Core Business Pillars
1. **Wellness Products**: Premium TCM-based health supplements and beverages
2. **NHSP TCM Clinics**: Physical clinics offering traditional and modern treatments
3. **Blockchain Health Ecosystem**: Secure, transparent health data management

### Platform Features
- **E-commerce Platform**: Product catalog, shopping cart, and order management
- **Multi-Level Marketing**: 4-level deep commission tracking with network visualization
- **Free Membership**: Automatic membership upon registration (no discount tiers)
- **AI Integration**: Product recommendations and chatbot support using OpenAI
- **Role-Based Access**: Users, Managers, and Super Admins with different permissions

The platform supports web, admin, and mobile applications sharing a common backend API.

## Repository Structure

```
grabhealth-app/              # Turborepo monorepo root
├── apps/
│   ├── app-be/             # Backend API (Express.js 5.1.0 + TypeScript + Prisma)
│   ├── app-web/            # Customer web portal (Next.js 15.3.2 + React 19 + AI)
│   ├── app-admin/          # Admin dashboard (Next.js 15.3.2)
│   └── app-mobile/         # Mobile app (React Native/Expo ~53.0.9)
├── packages/
│   └── shared-types/       # Shared TypeScript types for all apps
└── turbo.json             # Turborepo configuration
```

## Common Development Commands

### Monorepo Commands (from root)

```bash
# Development
bun install              # Install all dependencies
bun run dev              # Run all apps concurrently
bun run dev:be           # Backend only
bun run dev:web          # Web app only - Ecommerce
bun run dev:admin        # Admin app only
bun run dev:mobile       # Mobile app only

# Build & Test
bun run build            # Build all apps
bun run test             # Run all tests
bun run lint             # Lint all apps
bun run format           # Format all code
```

### Backend (app-be)

```bash
# Development
bun run dev              # Start dev server with hot reload
bun run build            # Build TypeScript
bun run start            # Start production server

# Database
bun run prisma:generate  # Generate Prisma client
bun run prisma:migrate   # Run database migrations
bun run prisma:studio    # Open Prisma Studio GUI
bun run prisma:seed      # Seed database with test data

# Testing
bun run test             # Run all tests
bun run test:unit        # Run unit tests only
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Generate coverage report

# Docker Services
bun run docker:start     # Start Redis
bun run docker:start-all # Start all services (Redis, PostgreSQL, GUIs)
bun run docker:stop      # Stop all services

# Code Quality
bun run lint             # Run ESLint
bun run format           # Run Prettier
```

### Web Apps (app-web, app-admin)

```bash
bun run dev             # Start Next.js dev server
bun run build           # Build for production
bun run start           # Start production server
bun run lint            # Run Next.js linting

# app-web specific
bun run db:migrate      # Run Prisma migrations (app-web has its own DB)
bun run db:seed         # Seed database
bun run db:studio       # Open Prisma Studio
```

### Mobile App (app-mobile)

```bash
bun run start           # Start Expo dev server
bun run android         # Run on Android
bun run ios             # Run on iOS
bun run web             # Run on web browser
bun run lint            # Run Expo linting
```

### Shared Types (packages/shared-types)

```bash
# Types are linked locally using file: protocol
# Import in any app:
import { UserRole, IUser } from '@app/shared-types';
```

## Type Sharing

All TypeScript types, interfaces, and enums are centralized in `packages/shared-types`:

```typescript
// Import shared types in any app
import { IUser, UserRole, ApiResponse } from "@app/shared-types";
```

See [packages/shared-types/README.md](packages/shared-types/README.md) for detailed usage.

## Architecture Notes

### Backend Architecture (app-be)

- RESTful API built with Express.js 5.1.0 and TypeScript
- Prisma ORM 6.8.2 for database operations with PostgreSQL/SQLite
- Bcrypt for password hashing and JWT for authentication
- Modular structure: controllers, services, models, middleware
- API versioning (v1) with Swagger documentation at `/api-docs`
- Redis (ioredis) caching for session management and performance
- Multer 2.0 for file uploads with validation
- Winston logging with Morgan for HTTP request logging
- Jest testing framework with unit and integration tests
- Docker support for PostgreSQL and Redis services

### Frontend Architecture (app-web)

- Next.js 15.3.2 with App Router and React 19
- Server-side rendering with streaming
- Tailwind CSS 3.4.17 + shadcn/ui components (@radix-ui)
- AI integration using Vercel AI SDK and OpenAI 4.98.0
- React Hook Form 7.54.1 + Zod 3.24.1 for form validation
- Context providers for Auth, Cart, Membership, and Commission
- Cloudinary 2.6.1 integration for image uploads
- Direct API calls to Express.js backend (no Next.js API routes)
- API requests proxied through Next.js rewrites to avoid CORS issues
- Cookie-based authentication with httpOnly cookies
- QR code generation with react-qr-code
- Charts and data visualization with Recharts

### Admin Dashboard (app-admin)

- Next.js 15.3.2 with React 19 and TypeScript
- Tailwind CSS 4.0 for styling
- Runs on port 3100 to avoid conflicts
- Minimal dependencies focused on admin functionality
- Shares types with @app/shared-types package

### Mobile Architecture (app-mobile)

- Expo SDK ~53.0.9 with React Native 0.79.2
- Expo Router 5.0.6 for file-based navigation
- React Navigation 7.x for bottom tabs and stack navigation
- Expo managed workflow with web support
- AsyncStorage for local data persistence
- React Hook Form for form handling
- Axios for API communication with backend
- Platform-specific code handling (iOS/Android/Web)

### Key Integration Points

- **Authentication**: JWT tokens stored in httpOnly cookies with refresh token rotation
- **API Communication**: 
  - All clients communicate directly with Express.js backend at port 4000
  - Frontend uses Next.js rewrites to proxy API calls through same origin
  - No Next.js API routes - all API logic in Express.js backend
- **Database**: PostgreSQL with Prisma ORM
- **Shared Types**: All apps import from @app/shared-types
- **File Storage**: Cloudinary for web, local storage for backend
- **Caching**: Redis for session management and API responses
- **CORS**: Configured for development with cookie support
- **Real-time**: WebSocket support for future features

## Important Considerations

### Development Setup

1. **Environment Variables**: Each app has its own `.env` file
   - Backend: Database URL, JWT secrets, email config, Redis URL
   - Web: Cloudinary, OpenAI API key, backend URL
   - See `.env.example` files in each app directory
   
   **Important**: When modifying environment variables, ensure synchronization:
   - If you modify `apps/app-web/.env` → also update `/app-web.env`
   - If you modify `apps/app-be/.env` → also update `/app-be.env`
   - If you modify `apps/app-admin/.env` → also update `/app-admin.env`
   - This ensures consistency between local development and deployment configurations

2. **Database Setup**:
   - Backend uses Prisma with PostgreSQL
   - Single database shared by all apps
   - Run migrations before starting development
   - Seed data includes test users with MLM relationships

3. **Test Credentials** (after seeding):
   - Super Admin: super.admin@example.com / NewPass@123
   - Manager: manager@example.com / NewPass@123
   - User: user1@example.com / NewPass@123

### Key Business Logic

1. **Commission Structure**:
   
   **Distribution Model** (Two Sales Channels):
   - **Individual Sales Representatives**: Direct sales with multi-level commissions
   - **Authorized Partner Companies**: Wholesale partners managing their own sales force
   
   **Commission Rates**:
   - **Sales Representative**: 30% (first-level, direct sales commission)
   - **Team Leader**: 10% (second-level, upline commission)
   - **Manager**: 5% (third-level commission)
   - **Platform Owner**: 5% (platform fee)
   - **Partner Company**: 5% (for partner channel sales)
   
   **Role-Based Pricing Matrix** (All prices in SGD):
   
   | Role | Realman | Wild Ginseng Honey | Golden Ginseng Water | Travel Packages |
   |------|---------|-------------------|---------------------|-----------------|
   | Customer | $3,600 | $1,000 | $18.90 | $799 |
   | Sales | $2,520 | $700 | $13.23 | $559.30 |
   | Leader | $2,160 | $600 | $11.34 | $479.40 |
   | Manager | $1,980 | $550 | $10.40 | $439.45 |
   | Company | $1,800 | $500 | $9.45 | $399.50 |
   
   **Commission Calculation**:
   - Based on price differential between role levels
   - Example: Realman sold by Sales Rep = $3,600 - $2,520 = $1,080 commission (30%)
   - Remaining margin covers product costs and operations
   
   **Implementation Details**:
   - Commissions calculated on pre-tax sale price
   - Monthly payouts with minimum thresholds
   - Network visualization in admin panel
   - See documents/commission.md for full details

2. **Membership System**:
   - Free membership upon registration
   - No discount tiers - pricing based on product levels
   - System supports future paid membership tiers

3. **Product Management**:
   - Admin can manage product catalog
   - AI-powered recommendations based on user behavior
   - Tiered pricing with membership discounts
   
### Current Product Catalog

1. **Realman (真男人)**
   - Premium herbal supplement for men's health and vitality
   - Key ingredients: Wild Ginseng, Deer Jerky, Rehmannia, Turmeric, Goji Berry
   - Benefits: Stamina, energy, reproductive health, immunity boost
   - Packaging: 6 bottles per box, 3g per dose, 1 bottle every 10 days

2. **Wild Ginseng Honey (蜜制人参)**
   - Natural wellness blend for energy and vitality
   - Target: Students, professionals, elderly, wellness enthusiasts
   - Promotes wellness through traditional ingredients

3. **Golden Ginseng Water (金参水)**
   - Premium health beverage with visible ginseng root
   - Ingredients: Ginseng, Chrysanthemum, Jasmine, Black Truffle, Wolfberry
   - Benefits: Energy boost, mental focus, immunity, anti-aging
   - Features: Luxurious golden hue, elegant packaging

### Security Features

- Password validation: 8+ chars, uppercase, lowercase, number, special char
- Rate limiting on auth endpoints
- Input validation and sanitization
- CORS configuration for production
- Secure cookie settings with httpOnly flags
- Role-based middleware protection

### Authentication Flow

1. **Frontend (app-web)**:
   - Uses `/api` as base URL which proxies to backend through Next.js rewrites
   - All API calls include `withCredentials: true` for cookie support
   - AuthContext manages user state and authentication
   - No Next.js API routes - all auth handled by Express.js backend

2. **Backend (app-be)**:
   - JWT tokens stored in httpOnly cookies (accessToken, refreshToken)
   - Cookie configuration: `httpOnly: true`, `secure: production only`, `sameSite: 'lax'`
   - Tokens extracted from cookies in authenticate middleware
   - Email verification flow with 4-digit codes (10 min expiry)

3. **API Proxy Setup**:
   - Next.js rewrites: `/api/*` → `http://localhost:4000/api/v1/*`
   - Avoids CORS issues between different ports
   - Cookies work seamlessly as requests appear same-origin