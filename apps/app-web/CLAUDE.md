# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

GrabHealth AI is a comprehensive e-commerce platform for health products with multi-level marketing (MLM) capabilities. Built with Next.js 15, TypeScript, and PostgreSQL (Neon), it features membership tiers, commission tracking, and AI-powered product recommendations.

## Development Commands

```bash
# Install dependencies (using bun)
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint

# Database commands
bun run db:migrate   # Run Prisma migrations
bun run db:seed      # Seed database with initial data
bun run db:studio    # Open Prisma Studio for database exploration
```

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: 
  - Production: Neon PostgreSQL (serverless)
  - Development: SQLite with Prisma ORM (migration in progress)
- **ORM**: Prisma (migrating from raw SQL queries)
- **AI Integration**: OpenAI SDK, Vercel AI SDK
- **Authentication**: Custom cookie-based sessions with bcrypt
- **File Storage**: Cloudinary for image uploads
- **Package Manager**: Bun

### Key Architectural Patterns

1. **File-based Routing**: Uses Next.js App Router with server components
2. **API Structure**: All API endpoints in `/app/api/` following RESTful patterns
3. **State Management**: Context providers for Auth, Cart, Membership, and Commission
4. **Component Architecture**: Reusable UI components in `/components/ui/` (shadcn/ui)
5. **Database Access**: Direct PostgreSQL queries using @neondatabase/serverless

### Project Structure

```
app/
├── api/          # API routes (auth, cart, products, commission, etc.)
├── admin/        # Admin panel pages
├── auth/         # Authentication pages (login, register)
├── (pages)/      # Public pages (products, cart, profile, etc.)
components/
├── ui/           # shadcn/ui components
├── admin/        # Admin-specific components
├── commission/   # MLM/commission components
hooks/            # Custom React hooks
lib/              # Utility functions and database helpers
db/               # Database schema and migration files
```

### Database Schema

Main tables:
- `users` - User accounts with role-based access (customer/admin)
- `products` - Product catalog with tiered discounts
- `orders` - Order management with status tracking
- `membership_tiers` - Essential and Premium membership levels
- `commissions` - MLM commission tracking
- `user_relationships` - Upline/downline network structure

### Important Configuration

1. **Environment Variables** (required in `.env`):
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary configuration
   - `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
   - `OPENAI_API_KEY` - For AI features

2. **Build Configuration** (`next.config.mjs`):
   - TypeScript and ESLint errors are ignored during builds
   - Image optimization is disabled

### Key Features

1. **E-commerce**: Product catalog, shopping cart, order management
2. **Membership System**: Two-tier membership with discount benefits
3. **MLM/Commission**: Multi-level marketing with upline/downline tracking
4. **Admin Panel**: User management, network visualization, settings
5. **AI Integration**: Product recommendations and chatbot support

### Authentication Flow

- Cookie-based sessions stored in `user_session`
- Middleware protects routes requiring authentication
- Admin routes protected with role-based access control
- Password hashing using bcryptjs

### Development Notes

- **Database Migration**: Currently migrating from Neon raw SQL to Prisma ORM
  - Use feature flags in `.env` to control which modules use Prisma
  - Database abstraction layer in `lib/db-adapter.ts` allows gradual migration
- **Local Development**: Uses SQLite with Prisma for easier setup
- **Production**: Still uses Neon PostgreSQL
- All timestamps use PostgreSQL's TIMESTAMP type
- Commission calculations support up to 5 levels deep
- Mobile-responsive design using Tailwind CSS breakpoints
- Form validation uses React Hook Form with Zod schemas
- **Fixed Issues**: Sales volume calculation now uses actual order data instead of random values