# Shared Services Migration Plan

## Overview

This document outlines the migration of all services from the `app-web` application to a centralized `shared-services` package, enabling code reuse across all applications in the monorepo.

## Migration Status: ✅ COMPLETED

### Phase 1: Setup and Core Services (Completed)

#### 1.1 Package Setup ✅
- Created `/packages/shared-services` package
- Configured TypeScript with proper build scripts
- Fixed nested folder compilation issue with custom build script
- Set up proper exports in package.json

#### 1.2 Core Services Migration ✅
- **AuthService**: Authentication logic with cookie-based session support
- **ProductService**: Product catalog management
- **CartService**: Shopping cart functionality
- **OrderService**: Order processing and management

### Phase 2: Extended Services (Completed)

#### 2.1 Commission and User Services ✅
- **CommissionService**: MLM commission calculations and network management
- **UserService**: User profile and management

#### 2.2 Additional Services ✅
- **DashboardService**: Analytics and reporting
- **MembershipService**: Membership tier management
- **PartnerService**: Partner network and referrals
- **PromotionService**: Promotional campaigns
- **CategoryService**: Product categorization
- **ProfileService**: User profile management
- **AIService**: AI-powered recommendations and chatbot

### Phase 3: Integration (Completed)

#### 3.1 Service Provider Setup ✅
- Created `/apps/app-web/src/lib/services.ts` as the central service provider
- Configured API URL resolution for both server and client environments
- Implemented proper token/cookie handling

#### 3.2 Import Updates ✅
- Updated all component imports to use shared services
- Removed old service files from app-web
- Fixed all TypeScript compilation errors

#### 3.3 AuthContext Integration ✅
- Updated AuthContext to use shared AuthService
- Made userId parameters optional for cookie-based auth
- Maintained backward compatibility

## Architecture

### Service Layer Structure

```
packages/shared-services/
├── src/
│   ├── services/           # Business logic layer
│   │   ├── AuthService.ts
│   │   ├── ProductService.ts
│   │   └── ... (13 services total)
│   ├── interfaces/         # Data source contracts
│   │   ├── IAuthDataSource.ts
│   │   └── ...
│   ├── adapters/          # Implementation adapters
│   │   ├── api/          # REST API adapters
│   │   │   ├── BaseApiDataSource.ts
│   │   │   └── ...
│   │   ├── prisma/       # Database adapters
│   │   └── mock/         # Testing adapters
│   ├── types/            # Shared types
│   └── utils/            # Utilities
├── scripts/
│   └── build.js          # Custom build script
└── package.json
```

### Key Design Decisions

1. **Adapter Pattern**: Each service uses a data source interface, allowing different implementations (API, Prisma, Mock)
2. **BaseApiDataSource**: Eliminates code duplication with reusable CRUD methods
3. **Framework Agnostic**: Services can be used in Next.js, Express, or React Native
4. **Type Safety**: Full TypeScript support with shared types from `@app/shared-types`

## Implementation Details

### Service Factory (app-web)

```typescript
// /apps/app-web/src/lib/services.ts
const getApiUrl = () => {
  // Always use backend API directly
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
};

// Create service instances with API data sources
export const services = {
  auth: new AuthService({ dataSource: new ApiAuthDataSource(apiUrl, getAccessToken) }),
  product: new ProductService({ dataSource: new ApiProductDataSource(apiUrl, getAccessToken) }),
  // ... all other services
};
```

### Error Handling Strategy

1. **Graceful Degradation**: Components fall back to default data when APIs fail
2. **User-Friendly Messages**: Clear error messages instead of technical errors
3. **Logging**: Errors logged to console for debugging

## Benefits Achieved

1. **Code Reusability**: Services can be shared across web, admin, and mobile apps
2. **Maintainability**: Single source of truth for business logic
3. **Testability**: Services can be tested independently with mock adapters
4. **Scalability**: Easy to add new services or adapters
5. **Type Safety**: Consistent types across all applications

## Future Improvements

### 1. Enhanced Error Handling
- Implement retry logic with exponential backoff
- Add circuit breaker pattern for failing services
- Create global error boundary component

### 2. Caching Layer
- Add Redis caching adapter
- Implement cache invalidation strategies
- Support offline mode with local storage

### 3. Performance Optimizations
- Implement request deduplication
- Add response caching
- Support batch operations

### 4. Testing Infrastructure
- Add comprehensive unit tests for all services
- Create integration tests with mock adapters
- Set up E2E tests for critical flows

### 5. Monitoring and Analytics
- Add service performance metrics
- Implement error tracking (Sentry integration)
- Create service health dashboard

### 6. API Gateway Pattern
- Create Next.js API routes as a proxy layer
- Implement rate limiting
- Add request/response transformation

### 7. Authentication Enhancements
- Implement refresh token rotation
- Add OAuth providers support
- Support multi-factor authentication

## Migration Checklist

- [x] Create shared-services package structure
- [x] Implement base service architecture
- [x] Create data source interfaces
- [x] Implement API adapters with BaseApiDataSource
- [x] Migrate all 13 services
- [x] Update app-web to use shared services
- [x] Fix TypeScript build issues
- [x] Update AuthContext integration
- [x] Add error handling and fallbacks
- [x] Remove old service files
- [x] Test complete integration

## Conclusion

The migration to shared services has been successfully completed. All services are now centralized, maintainable, and reusable across the entire monorepo. The architecture supports future growth and additional adapters as needed.