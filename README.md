# App Template - Full-Stack Application Template

A modern full-stack application template with authentication and user management. Built with Next.js, Express.js, React Native, and TypeScript.

## 🏗️ Monorepo Structure

```
app-template/
├── apps/
│   ├── app-be/                # Backend API (Express.js + TypeScript + Prisma)
│   ├── app-web/               # Customer web portal (Next.js)
│   ├── app-admin/             # Admin portal (Next.js)
│   └── app-mobile/            # Mobile app (React Native/Expo)
├── packages/
│   └── shared-types/          # Shared TypeScript types and interfaces
└── docs/                      # Documentation files
    ├── CLAUDE.md             # AI assistant instructions
    ├── architecture.md       # System architecture
    ├── developer.md          # Developer guide
    └── project.md            # Project overview
```

This is a **Turbo-powered monorepo** using Bun workspaces for efficient dependency management and build orchestration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun 1.0+
- SQLite (for development)
- iOS/Android development environment (for mobile app)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/app-template.git
   cd app-template
   ```

2. **Install all dependencies** (from root directory)

   ```bash
   bun install
   ```

3. **Set up the backend**
   ```bash
   cd apps/app-be
   cp .env.example .env  # Configure your environment variables
   bun run prisma:migrate
   bun run prisma:seed
   ```

### Running the Applications

#### Run All Applications (from root)

```bash
bun run dev  # Starts all apps concurrently
```

#### Run Individual Applications

1. **Backend API** (Port 4000)

   ```bash
   # From root directory
   bun run dev:be
   # OR
   bun run dev --filter=app-be
   ```

2. **Web Portal** (Port 3000)

   ```bash
   # From root directory
   bun run dev:web
   # OR
   bun run dev --filter=app-web
   ```

3. **Admin Portal** (Port 3100)

   ```bash
   # From root directory
   bun run dev:admin
   # OR
   bun run dev --filter=app-admin
   ```

4. **Mobile App**
   ```bash
   # From root directory
   bun run dev:mobile
   # OR
   bun run dev --filter=app-mobile
   # Press 'i' for iOS or 'a' for Android
   ```

## 📦 Shared Types Package

All TypeScript types and interfaces are centralized in the `@app/shared-types` package to ensure consistency across all applications.

### Structure

```
packages/shared-types/
├── src/
│   ├── index.ts              # Main export file
│   ├── enums/               # Shared enumerations
│   ├── types/               # Common types
│   │   ├── auth.ts          # Authentication types
│   │   └── common.ts        # Common/utility types
│   └── models/              # Data model interfaces
│       └── user.ts          # User model interfaces
```

### Usage

The shared-types package is automatically linked via Bun workspaces. Each app references it as:

```json
{
  "dependencies": {
    "@app/shared-types": "*"
  }
}
```

Import types in your code:

```typescript
import { UserRole, IUser, ApiResponse } from '@app/shared-types';
```

## 👥 User Roles

The template supports three user roles with different access levels:

- **SUPER_ADMIN**: Platform administrators with full system access
- **MANAGER**: Middle-level users with management capabilities
- **USER**: Standard users with basic access

## 🔑 Features

- **Authentication**: Email/password login with JWT tokens
- **User Management**: User registration, profile management
- **Role-based Access**: Different permissions for different user types
- **Email Verification**: Email verification workflow
- **Password Reset**: Forgot password functionality
- **Multi-platform**: Web, admin portal, and mobile apps

## 🛠️ Development

### Database Commands

```bash
# Run migrations
bun run prisma:migrate

# Open Prisma Studio
bun run prisma:studio

# Seed the database
bun run prisma:seed

# Generate Prisma client
bun run prisma:generate
```

### Build Commands

#### Build All Applications

```bash
# From root directory
bun run build  # Builds all apps in dependency order
```

#### Build Individual Applications

```bash
# Build specific app (from root)
bun run build --filter=app-be      # Backend only
bun run build --filter=app-web     # Web app only
bun run build --filter=app-admin   # Admin app only

# Or use the convenience scripts
bun run build:be     # Build backend
bun run build:web    # Build web app
bun run build:admin  # Build admin app

# Build shared packages
bun run build --filter=@app/shared-types

# Build mobile app (requires EAS CLI)
cd apps/app-mobile && eas build
```

#### Other Turbo Commands

```bash
# Run linting across all apps
bun run lint

# Run linting for specific app
bun run lint --filter=app-be

# Format all code
bun run format

# Run tests
bun run test

# Clean all build artifacts
bun run clean
```

### Testing

```bash
# Run backend tests
cd app-be && bun run test

# Run web app tests
cd app-web && bun run test
```

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure HTTP-only cookies for web sessions
- Email verification and password reset functionality

## 🌍 Environment Variables

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
```

### Web Apps (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

### Mobile App

Configure in `app.json` or use environment-specific config files.

## 📄 API Documentation

The backend API is documented with Swagger/OpenAPI. Access the documentation at:

```
http://localhost:4000/api-docs
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ as a modern app template 1
