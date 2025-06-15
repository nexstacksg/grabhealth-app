# @app/shared-services

Shared business logic services for GrabHealth applications. This package provides framework-agnostic services that can be used across backend (Express), frontend (Next.js), and mobile (React Native) applications.

## Features

- 🔧 **Framework Agnostic**: Works with any JavaScript/TypeScript framework
- 🔌 **Adapter Pattern**: Flexible data sources (Prisma, API, Mock)
- 🔒 **Built-in Authorization**: Role-based access control
- 📱 **Cross-Platform**: Use the same business logic everywhere
- 🧪 **Testable**: Mock adapters for easy testing
- 🔍 **Type Safe**: Full TypeScript support

## Installation

```bash
# From the monorepo root
bun install

# Build the package
cd packages/shared-services
bun run build
```

## Architecture

The package follows a clean architecture pattern with three main layers:

1. **Services**: Business logic and authorization rules
2. **Data Sources**: Interfaces defining data operations
3. **Adapters**: Implementations for different environments

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Application   │────▶│     Service      │────▶│   Data Source   │
│  (Next.js, etc) │     │  (Business Logic)│     │   (Interface)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                              ┌────────────────────────────┼────────────────────────────┐
                              │                            │                            │
                        ┌─────▼─────┐              ┌──────▼──────┐            ┌────────▼────────┐
                        │  Prisma   │              │     API     │            │      Mock       │
                        │  Adapter  │              │   Adapter   │            │     Adapter     │
                        │ (Backend) │              │ (Frontend)  │            │    (Testing)    │
                        └───────────┘              └─────────────┘            └─────────────────┘
```

## Usage

### Backend (Express + Prisma)

```typescript
import { PrismaClient } from '@prisma/client';
import { AuthService, PrismaAuthDataSource } from '@app/shared-services';
import { generateTokens, verifyRefreshToken } from './utils/jwt';

const prisma = new PrismaClient();

const authService = new AuthService({
  dataSource: new PrismaAuthDataSource(prisma, {
    generateTokens,
    verifyRefreshToken
  })
});

// In your controller
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});
```

### Frontend (Next.js)

```typescript
import { AuthService, ApiAuthDataSource } from '@app/shared-services';
import { cookies } from 'next/headers';

const authService = new AuthService({
  dataSource: new ApiAuthDataSource(
    process.env.NEXT_PUBLIC_API_URL!,
    async () => cookies().get('accessToken')?.value || null
  )
});

// In a Server Component
export async function LoginForm() {
  async function login(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      const result = await authService.login({ email, password });
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
  
  return <form action={login}>...</form>;
}
```

### Mobile (React Native)

```typescript
import { AuthService, ApiAuthDataSource } from '@app/shared-services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from './config';

const authService = new AuthService({
  dataSource: new ApiAuthDataSource(
    Config.API_URL,
    async () => AsyncStorage.getItem('accessToken')
  )
});

// In your component
const handleLogin = async (email: string, password: string) => {
  try {
    const result = await authService.login({ email, password });
    await AsyncStorage.setItem('accessToken', result.tokens.accessToken);
    // Navigate to home
  } catch (error) {
    // Show error
  }
};
```

### Testing

```typescript
import { AuthService, MockAuthDataSource } from '@app/shared-services';

describe('AuthService', () => {
  let authService: AuthService;
  let mockDataSource: MockAuthDataSource;

  beforeEach(() => {
    mockDataSource = new MockAuthDataSource();
    authService = new AuthService({
      dataSource: mockDataSource
    });
  });

  test('should login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'Test@123'
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.tokens.accessToken).toBeDefined();
  });

  test('should throw error with invalid credentials', async () => {
    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong'
      })
    ).rejects.toThrow('Invalid email or password');
  });
});
```

## Build Configuration

### TypeScript Compilation Issue

Due to the monorepo structure and TypeScript's handling of external dependencies, the standard `tsc` command creates nested folder structures in the `dist` directory when importing from `@app/shared-types`. 

**Problem**: TypeScript outputs files to `dist/shared-services/src/` instead of `dist/` directly.

**Solution**: We use a custom build script that automatically fixes the directory structure after compilation.

### Build Script

The build process is handled by `scripts/build.js`, which:

1. Runs TypeScript compilation (`tsc`)
2. Detects nested folder structure
3. Automatically moves files to the correct location
4. Cleans up temporary directories

```bash
# Standard build command (automatically uses the build script)
bun run build

# Manual TypeScript compilation (creates nested structure)
bun run build:tsc
```

### Build Script Details

Located at `scripts/build.js`, the script performs these steps:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building shared-services...');

// Run TypeScript compiler
execSync('tsc', { stdio: 'inherit' });

// Fix dist structure by moving files from nested folders
const distDir = path.join(__dirname, '..', 'dist');
const nestedSrcDir = path.join(distDir, 'shared-services', 'src');

if (fs.existsSync(nestedSrcDir)) {
  console.log('Fixing dist structure...');
  
  // Copy all files from nested src to dist root
  execSync(`cp -r "${nestedSrcDir}"/* "${distDir}"/`, { stdio: 'inherit' });
  
  // Remove nested folders
  execSync(`rm -rf "${distDir}/shared-services" "${distDir}/shared-types"`, { stdio: 'inherit' });
  
  console.log('Dist structure fixed!');
}

console.log('Build complete!');
```

This ensures a clean `dist/` structure:
```
dist/
├── index.js
├── index.d.ts
├── services/
├── adapters/
├── interfaces/
├── types/
└── utils/
```

Instead of the problematic nested structure:
```
dist/
├── shared-services/
│   └── src/
│       ├── services/
│       └── ...
└── shared-types/
    └── src/
        └── ...
```

## Available Services

### AuthService

Handles authentication and user management:

- `login(credentials)` - Authenticate user
- `register(data)` - Create new user account
- `logout(userId)` - End user session
- `refreshToken(token)` - Get new access token
- `getProfile(userId)` - Get user profile
- `requestPasswordReset(email)` - Start password reset flow
- `resetPassword(token, newPassword)` - Complete password reset
- `verifyEmail(email)` - Send verification code
- `verifyEmailCode(email, code)` - Verify email with code
- `resendVerificationCode(email)` - Resend verification

### ProductService

Handles product catalog operations:

- `searchProducts(params)` - Search products with filters
- `getProduct(id)` - Get product by ID
- `getProductsByCategory(categoryId)` - Get products in category
- `getCategories()` - Get all product categories
- `getFeaturedProducts(limit)` - Get featured products

### CartService

Manages shopping cart operations:

- `getCart()` - Get current user's cart
- `addToCart(productId, quantity)` - Add item to cart
- `updateCartItem(productId, quantity)` - Update item quantity
- `removeFromCart(productId)` - Remove item from cart
- `clearCart()` - Empty the cart

### OrderService

Handles order processing:

- `createOrder(data)` - Create new order
- `getMyOrders(page, limit)` - Get user's orders with pagination
- `getOrder(id)` - Get order by ID
- `cancelOrder(id)` - Cancel an order
- `getOrderStats()` - Get order statistics
- `checkoutFromCart(paymentMethod, shippingAddress, billingAddress)` - Checkout

### CommissionService

Manages MLM commission system:

- `getMyCommissions()` - Get user's commissions
- `getCommissionStats()` - Get commission statistics
- `getNetwork()` - Get MLM network structure
- `getNetworkStats()` - Get network statistics
- `getCommission(id)` - Get commission by ID
- `initializeCommissionSystem()` - Initialize commission system
- `getCommissionData()` - Get full commission data (upline, downlines, etc.)
- `getCommissionStructure()` - Get commission structure configuration

### UserService

Handles user profile and management:

- `getMyProfile()` - Get current user profile
- `updateMyProfile(data)` - Update user profile
- `uploadProfilePhoto(file)` - Upload profile photo
- `changePassword(data)` - Change user password
- `getUserById(userId)` - Get user by ID (admin)
- `listUsers(params)` - List users with search (admin)
- `updateUser(userId, data)` - Update user (admin)
- `deleteUser(userId)` - Delete user (admin)

### Authorization Helpers

Built-in methods for checking permissions:

```typescript
// Check if a user can view another user's profile
authService.canViewUser(targetUserId, requestingUserId, requestingUserRole);

// Check if a user can modify another user's data
authService.canModifyUser(targetUserId, requestingUserId, requestingUserRole);
```

## Creating Custom Adapters

You can create custom adapters for specific environments:

```typescript
import { IAuthDataSource } from '@app/shared-services';

export class CustomAuthDataSource implements IAuthDataSource {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Your custom implementation
  }
  
  // Implement other required methods...
}
```

## Error Handling

The package provides standardized error types:

- `ValidationError` - Invalid input data (400)
- `AuthenticationError` - Failed authentication (401)
- `AuthorizationError` - Insufficient permissions (403)
- `NotFoundError` - Resource not found (404)
- `ConflictError` - Resource conflict (409)
- `ServiceError` - General service error (500)

```typescript
try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof AuthenticationError) {
    // Handle auth error
  }
}
```

## Development

```bash
# Install dependencies
bun install

# Build the package (uses custom build script)
bun run build

# Build with TypeScript only (creates nested structure)
bun run build:tsc

# Clean build directory
bun run clean

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch

# Generate test coverage report
bun run test:coverage

# Watch mode for development (TypeScript compiler)
bun run dev
```

### Build Process Details

The build process uses a custom script to handle TypeScript compilation issues in the monorepo:

1. **`bun run build`** - Recommended build command
   - Runs TypeScript compiler
   - Automatically fixes dist directory structure
   - Outputs clean, ready-to-use files

2. **`bun run build:tsc`** - Direct TypeScript compilation
   - Only runs `tsc` command
   - Creates nested directory structure
   - Requires manual cleanup

3. **`bun run clean`** - Cleanup command
   - Removes entire `dist` directory
   - Useful before fresh builds

The custom build script ensures compatibility with Next.js and other consuming applications by maintaining the expected `dist/` structure.

## Services In Development

The following services are being migrated from the existing app-web implementation:

- `MembershipService` - Membership tier management
- `DashboardService` - Analytics and reporting  
- `PromotionService` - Promotions and coupons
- `PartnerService` - Partner/referral management
- `ProfileService` - Extended profile functionality
- `CategoryService` - Product category management
- `AIService` - AI recommendations and chat

## Migration Status

✅ **Completed Services:**
- AuthService - Authentication and user management
- ProductService - Product catalog operations  
- CartService - Shopping cart functionality
- OrderService - Order processing and management
- CommissionService - MLM commission system
- UserService - User profile and admin operations

🔄 **In Progress:**
- Remaining 7 services from app-web
- Service provider integration
- Cross-platform testing

📋 **Next Steps:**
- Complete service migration
- Add Prisma adapters for backend use
- Enhanced error handling
- Performance optimizations

## Contributing

1. Follow the existing patterns for consistency
2. Add comprehensive tests for new services
3. Update this README with usage examples
4. Ensure all adapters implement the full interface

## License

MIT