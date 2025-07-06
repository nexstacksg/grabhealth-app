# GrabHealth AI - Wellness E-commerce Platform

A simplified wellness e-commerce platform with referral system and partner services, built with Next.js 15 and Strapi 5.

## 🏗️ Monorepo Structure

```
grabhealth-app/
├── apps/
│   ├── app-web/               # Customer web portal (Next.js 15)
│   └── app-strapi/            # Backend CMS + Admin (Strapi 5)
├── packages/
│   └── shared-types/          # Shared TypeScript types
└── documents/                 # Documentation files
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- PostgreSQL (for production) or SQLite (for development)
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/grabhealth-app.git
   cd grabhealth-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # For web app
   cp apps/app-web/.env.example apps/app-web/.env.local
   
   # For Strapi
   cp apps/app-strapi/.env.example apps/app-strapi/.env
   ```

4. **Start development servers**
   ```bash
   pnpm run dev  # Starts both web and Strapi
   ```

## 🔑 Key Features

### E-commerce
- Product catalog with categories
- Shopping cart functionality
- Order management with dual status system
- HitPay payment integration

### Referral System
- Unique referral codes for each user
- Upline/downline tracking
- Network visualization in admin panel

### Partner Services
- Partner clinics and healthcare providers
- Service bookings and appointments
- Availability management

### Payment Flow (Updated)
1. **Order Before Payment**: Orders are created with `PENDING_PAYMENT` status before redirecting to payment
2. **Dual Status System**: 
   - `status`: Order lifecycle (PENDING_PAYMENT → PROCESSING → COMPLETED)
   - `paymentStatus`: Payment state (PENDING → PAID/FAILED → REFUNDED)
3. **Webhook Integration**: HitPay webhooks update order status after payment
4. **No Lost Orders**: Orders exist even if payment fails

## 📦 Technology Stack

### Frontend (app-web)
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Server Actions for API calls

### Backend (app-strapi)
- Strapi 5 (Headless CMS)
- PostgreSQL (production) / SQLite (development)
- JWT authentication
- RESTful API

### Shared Types
- Centralized TypeScript types
- Shared enums and interfaces
- Type safety across monorepo

## 🛠️ Development Commands

### Monorepo Commands
```bash
# Development
pnpm run dev              # Run all apps
pnpm run dev:web          # Web app only
pnpm run dev:strapi       # Strapi only

# Build
pnpm run build            # Build all apps
pnpm run build:web        # Build web app
pnpm run build:strapi     # Build Strapi

# Code Quality
pnpm run lint             # Lint all code
pnpm run format           # Format with Prettier
```

### Strapi Commands
```bash
cd apps/app-strapi
pnpm run develop          # Start dev server
pnpm run build            # Build admin panel
pnpm run start            # Start production server
```

## 🔐 Environment Variables

### Web App (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Payment (HitPay)
NEXT_PUBLIC_HITPAY_API_KEY=your_api_key
HITPAY_API_KEY=your_api_key
HITPAY_SALT=your_salt
HITPAY_WEBHOOK_SALT=your_webhook_salt
NEXT_PUBLIC_HITPAY_MODE=sandbox

# Strapi API Token (for webhooks)
STRAPI_API_TOKEN=your_strapi_api_token
```

### Strapi (.env)
```env
# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337

# Security
APP_KEYS=your_app_keys
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
JWT_SECRET=your_jwt_secret
```

## 📝 Recent Updates

### Payment Flow Improvements (Latest)
- **Order Creation Before Payment**: Orders are now created with `PENDING_PAYMENT` status before payment
- **Removed Internal API**: Eliminated internal API endpoint, using server actions instead
- **Simplified Webhook**: Webhook now only updates order status instead of creating orders
- **Removed PV Points**: Simplified system by removing pvPoints tracking
- **Better Error Handling**: Orders are never lost, even if payment fails

### Benefits of New Flow
- No lost orders during payment failures
- Better tracking of abandoned checkouts
- Immediate order confirmation on success page
- Minimal use of API tokens (only for webhook updates)
- Cleaner architecture without internal APIs

## 🐛 Common Issues & Solutions

- **Orders not created after payment**: Check webhook logs and ensure STRAPI_API_TOKEN is set
- **Payment redirect issues**: Verify NEXT_PUBLIC_BASE_URL matches your domain
- **Webhook failures**: Check HitPay webhook URL configuration and signature verification
- **Type errors**: Run `pnpm run build` in Strapi to regenerate types
- **Port conflicts**: Ensure ports 3000 (web) and 1337 (Strapi) are available

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines
- [Setup Production](./documents/setup-production.md) - Production deployment guide
- [Features](./documents/features.md) - Complete feature list

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by GrabHealth Team