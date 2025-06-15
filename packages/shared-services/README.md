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

# Build the package
bun run build

# Run tests
bun run test

# Watch mode for development
bun run dev
```

## Future Services

Planned services to be added:

- `ProductService` - Product catalog management
- `CartService` - Shopping cart operations
- `OrderService` - Order processing
- `CommissionService` - MLM commission calculations
- `MembershipService` - Membership tier management
- `PromotionService` - Promotions and coupons
- `DashboardService` - Analytics and reporting
- `AIService` - AI recommendations and chat

## Contributing

1. Follow the existing patterns for consistency
2. Add comprehensive tests for new services
3. Update this README with usage examples
4. Ensure all adapters implement the full interface

## License

MIT