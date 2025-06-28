# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GrabHealth AI is a simplified wellness e-commerce platform with referral capabilities. The platform focuses on three core features: e-commerce (products/orders), referral system (upline/downline tracking), and partner services (bookings).

### Core Business Model

1. **E-commerce**: Sell wellness products online
2. **Referral System**: Users can refer others and track their network
3. **Partner Services**: Partners offer health services that users can book

## Repository Structure

```
grabhealth-app/              # Turborepo monorepo root
├── apps/
│   ├── app-web/            # Customer web portal (Next.js 15 + React 19)
│   └── app-strapi/         # Headless CMS backend + Admin (Strapi 5)
├── packages/
│   └── shared-types/       # Shared TypeScript types
└── turbo.json             # Turborepo configuration
```

## Common Development Commands

### Monorepo Commands (from root)

```bash
# Development
pnpm install              # Install all dependencies
pnpm run dev              # Run web + strapi concurrently
pnpm run dev:web          # Web app only
pnpm run dev:strapi       # Strapi only

# Build & Test
pnpm run build            # Build all apps
pnpm run lint             # Lint all apps
pnpm run format           # Format all code
```

### Strapi Backend (app-strapi)

```bash
# Development
pnpm run dev              # Start Strapi dev server
pnpm run build            # Build Strapi admin panel
pnpm run start            # Start production server

# Content Types (simplified)
- User (with upline/downline relations)
- Product & Category
- Order & Order Items  
- Partner & Services
- Booking & Partner Availability
```

### Web App (app-web)

```bash
pnpm run dev             # Start Next.js dev server
pnpm run build           # Build for production
pnpm run start           # Start production server
```

## Architecture Overview

### Backend (Strapi)

- **API**: RESTful endpoints at `http://localhost:1337/api`
- **Auth**: JWT Bearer tokens from cookies
- **Database**: PostgreSQL (production) or SQLite (development)
- **Content Types**:
  - `User`: Basic user info + referral relations (upline/downline)
  - `Product/Category`: E-commerce catalog
  - `Order/OrderItem`: Purchase tracking
  - `Partner/Service`: Service providers and their offerings
  - `Booking`: Appointment scheduling

### Frontend (Next.js)

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **API Communication**: Direct to Strapi at port 1337
- **Authentication**: httpOnly cookies with JWT tokens
- **Key Pages**:
  - `/products` - Product catalog
  - `/cart` - Shopping cart
  - `/profile` - User profile with referral info
  - `/partners` - Partner services
  - `/booking` - Service booking

## Simplified Database Schema

```
Users
├── email, password, name
├── referralCode (unique)
├── upline (relation to user)
└── downlines (array of users)

Products → Categories
Orders → OrderItems → Products
Partners → Services
Bookings → Users + Services
```

## Key API Endpoints

- `GET /api/users/me?populate=*` - Get current user with relations
- `GET /api/products?populate=*` - List products
- `POST /api/orders` - Create order
- `GET /api/partners` - List partners
- `POST /api/bookings` - Create booking

## Important Notes

1. **Simplification Focus**: System has been simplified to focus on core features
2. **No Complex Roles**: Uses Strapi's built-in role system only
3. **No Membership Tiers**: All users have equal access
4. **Commission System**: Planned for future phases
5. **Referral Tracking**: Automatic via upline/downline relations
6. **Admin Management**: All admin tasks done through Strapi Admin Panel at http://localhost:1337/admin

## Development Guidelines

1. **Keep It Simple**: Focus on core features first
2. **Use Existing Patterns**: Follow established code patterns
3. **Test Core Flows**: Registration → Browse → Purchase → Track Referrals
4. **API-First**: All business logic in Strapi, frontend is presentation layer

## Common Issues & Solutions

- **Port 1337 in use**: Kill existing Strapi process
- **Type errors**: Run `pnpm run build` in Strapi to regenerate types
- **Auth issues**: Check JWT token in cookies and Bearer header
- **CORS errors**: Strapi CORS is configured for localhost:3000