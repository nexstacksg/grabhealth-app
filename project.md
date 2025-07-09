# GrabHealth AI - Simplified E-commerce Platform

## Project Status: Simplified & Refactored

### Overview
GrabHealth AI has been simplified to focus on three core features:
1. **E-commerce** - Product catalog and orders
2. **Referral System** - Upline/downline tracking  
3. **Partner Services** - Service bookings

### Current Architecture

#### Backend (Strapi v5)
- **Port**: 1337
- **Database**: PostgreSQL
- **Content Types**:
  - User (with upline/downline relations)
  - Product, Category
  - Order, Order Items
  - Partner, Service, Booking
  - Partner Availability, Partner Days Off

#### Frontend (Next.js 15)
- **Port**: 3000
- **Features**:
  - Product browsing and cart
  - User registration with referral codes
  - Profile page showing referral network
  - Partner service booking

### Removed Components
To simplify the system, we removed:
- Complex role types and permissions
- Membership tiers system
- Commission calculation (moved to future phase)
- Audit logging
- Points/rewards system
- Promotions
- Email verification flow

### API Structure
- **Base URL**: `http://localhost:1337/api`
- **Auth**: Bearer token from cookies
- **Main Endpoints**:
  - `/users/me` - User profile with relations
  - `/products` - Product catalog
  - `/orders` - Order management
  - `/partners` - Partner services
  - `/bookings` - Service bookings

### Quick Start
```bash
# From root directory
pnpm install
pnpm run dev:strapi  # Start backend
pnpm run dev:web     # Start frontend
```

### Next Steps
1. Fix UI/UX issues in profile page
2. Improve referral network display
3. Add commission calculation (Phase 2)
4. Implement payment gateway (Phase 3)

### Key Files
- `/CLAUDE.md` - AI assistant instructions
- `/documents/features.md` - Feature list
- `/apps/app-strapi/` - Backend code
- `/apps/app-web/` - Frontend code