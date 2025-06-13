# GrabHealth AI - Critical 2-Week Enhancement Plan

## Overview

This document outlines critical fixes and enhancements that must be implemented within the next 2 weeks to ensure platform stability, data integrity, and core functionality.

## Priority 1: Critical Fixes (Days 1-3)

### 1.1 Fix Sales Volume Tracking (CRITICAL)

**File**: `lib/product-commission.ts:430`
**Current Issue**: Sales volume is returned as random value, breaking commission calculations

```typescript
// CURRENT - BROKEN:
const salesVolume = Math.floor(Math.random() * 15000);
```

**Required Fix**:

```typescript
async function getSellerSalesVolume(sellerId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(o.total), 0) as total_volume
      FROM orders o
      WHERE o.user_id = ${sellerId}
      AND o.status = 'completed'
      AND o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    return parseFloat(result[0].total_volume);
  } catch (error) {
    console.error('Error getting seller sales volume:', error);
    return 0;
  }
}
```

### 1.2 Gradual Migration from Neon to Prisma

**Current State**: Mixed database access - Neon SQL for most operations, Prisma installed but underutilized
**Goal**: Migrate to Prisma ORM for better type safety, migrations, and developer experience

**Phase 1 - Setup Prisma Properly (Days 2-3)**:

```bash
# Initialize Prisma with existing database
npx prisma init
npx prisma db pull  # Generate schema from existing database
npx prisma generate # Generate Prisma Client
```

**Create Prisma Schema** (`prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                 Int      @id @default(autoincrement())
  email              String   @unique
  name               String?
  password           String
  role               String   @default("customer")
  // ... other fields
  orders             Order[]
  commissionsEarned  Commission[] @relation("RecipientCommissions")
  commissionsCreated Commission[] @relation("UserCommissions")
}
```

**Migration Strategy - Parallel Operation**:

1. Keep both Neon and Prisma running simultaneously
2. Create a database abstraction layer
3. Migrate one module at a time
4. Test thoroughly before removing Neon code

```typescript
// lib/db-adapter.ts - Abstraction layer
import { PrismaClient } from '@prisma/client';
import { neon } from '@neondatabase/serverless';

const prisma = new PrismaClient();
const sql = neon(process.env.DATABASE_URL!);

export const db = {
  // Start with read operations
  async getUserById(id: number) {
    if (process.env.USE_PRISMA === 'true') {
      return await prisma.user.findUnique({ where: { id } });
    }
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0];
  },

  // Gradually add more methods
  async createOrder(data: any) {
    if (process.env.USE_PRISMA === 'true') {
      return await prisma.order.create({ data });
    }
    // Existing Neon implementation
  },
};
```

### 1.3 Fix TypeScript Errors

**Current Issue**: Build ignores TypeScript errors (`ignoreBuildErrors: true`)
**Actions**:

1. Set `ignoreBuildErrors: false` in next.config.mjs
2. Fix all TypeScript errors:
   - Add proper types to API routes
   - Fix any implicit 'any' types
   - Add missing return types
   - Resolve module import errors

### 1.4 Database Schema Integrity

**Issue**: Missing indexes and constraints
**Required Actions**:

```sql
-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_recipient ON commissions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_upline ON user_relationships(upline_id);

-- Add missing constraints
ALTER TABLE orders ADD CONSTRAINT check_total_positive CHECK (total >= 0);
ALTER TABLE commissions ADD CONSTRAINT check_amount_positive CHECK (amount >= 0);
```

## Priority 2: Core Functionality (Days 4-7)

### 2.1 Commission Calculation Validation

**Issue**: No validation for commission calculations
**Implementation**:

```typescript
// Add to lib/commission.ts
export async function validateCommissionCalculation(
  orderId: number,
  expectedTotal: number
): Promise<boolean> {
  const commissions = await sql`
    SELECT SUM(amount) as total FROM commissions 
    WHERE order_id = ${orderId}
  `;
  const actualTotal = parseFloat(commissions[0].total || 0);
  const maxCommission = expectedTotal * 0.5; // Max 50% commission

  if (actualTotal > maxCommission) {
    console.error(
      `Commission exceeds maximum: ${actualTotal} > ${maxCommission}`
    );
    return false;
  }
  return true;
}
```

### 2.2 Order Status Management

**Issue**: No order status workflow
**Implementation**:

- Add order status transitions: pending → processing → completed/cancelled
- Add status change logging
- Implement commission triggers only on 'completed' status

### 2.3 Session Security Enhancement

**Issue**: Basic cookie sessions without proper security
**Actions**:

1. Add session expiration (24 hours)
2. Implement secure cookie flags
3. Add CSRF protection
4. Implement rate limiting on auth endpoints

```typescript
// middleware.ts enhancement
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');

  if (session) {
    // Validate session age
    const sessionData = JSON.parse(session.value);
    const sessionAge = Date.now() - sessionData.created_at;

    if (sessionAge > 24 * 60 * 60 * 1000) {
      // 24 hours
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  // ... rest of middleware
}
```

## Priority 3: Data Integrity & Prisma Migration (Days 8-10)

### 3.1 Transaction Management with Prisma

**Issue**: No database transactions for critical operations
**Implementation with Prisma (Preferred)**:

```typescript
// Using Prisma transactions (much cleaner!)
export async function createOrderWithCommissions(orderData: any) {
  return await prisma.$transaction(async (tx) => {
    // Create order
    const order = await tx.order.create({
      data: {
        userId: orderData.userId,
        total: orderData.total,
        status: 'pending',
        items: {
          create: orderData.items,
        },
      },
    });

    // Calculate commissions
    const uplineChain = await getUplineChain(order.userId, 4);

    // Create commission records
    const commissions = await Promise.all(
      uplineChain.map((upline) =>
        tx.commission.create({
          data: {
            orderId: order.id,
            userId: order.userId,
            recipientId: upline.uplineId,
            amount: calculateCommissionAmount(order.total, upline.level),
            commissionRate: getCommissionRate(upline.level),
            relationshipLevel: upline.level,
            status: 'pending',
          },
        })
      )
    );

    return { order, commissions };
  });
}
```

**Parallel Neon Implementation (Keep for now)**:

```typescript
// Keep existing Neon transaction code as fallback
// Use environment variable to switch between implementations
if (process.env.USE_PRISMA_TRANSACTIONS === 'true') {
  return createOrderWithCommissionsPrisma(orderData);
} else {
  return createOrderWithCommissionsNeon(orderData);
}
```

### 3.2 Add Audit Logging

**Implementation**:

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### 3.3 Data Validation Layer

**Add Zod schemas for all critical operations**:

```typescript
// lib/validations.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.number().positive(),
  items: z.array(
    z.object({
      productId: z.number().positive(),
      quantity: z.number().positive().max(100),
      price: z.number().positive(),
    })
  ),
  total: z.number().positive(),
});

export const commissionCalculationSchema = z.object({
  orderId: z.number().positive(),
  userId: z.number().positive(),
  orderTotal: z.number().positive().max(1000000),
});
```

## Priority 4: Performance & Monitoring (Days 11-14)

### 4.1 Add Application Monitoring

**Implementation**:

1. Add error tracking (Sentry)
2. Add performance monitoring
3. Add custom metrics for:
   - Commission calculation time
   - Order processing time
   - API response times

### 4.2 Database Query Optimization

**Actions**:

1. Add query result caching for frequently accessed data
2. Implement connection pooling properly
3. Add slow query logging

```typescript
// lib/cache.ts
const cache = new Map();

export async function getCachedUserRole(userId: number) {
  const cacheKey = `user_role_${userId}`;

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < 300000) {
      // 5 minutes
      return cached.data;
    }
  }

  const role = await getUserRole(userId);
  cache.set(cacheKey, { data: role, timestamp: Date.now() });
  return role;
}
```

### 4.3 API Rate Limiting

**Implementation**:

```typescript
// lib/rateLimiter.ts
const attempts = new Map();

export function rateLimiter(
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 60000
) {
  const now = Date.now();
  const userAttempts = attempts.get(identifier) || [];

  // Clean old attempts
  const validAttempts = userAttempts.filter(
    (timestamp: number) => now - timestamp < windowMs
  );

  if (validAttempts.length >= maxAttempts) {
    throw new Error('Rate limit exceeded');
  }

  validAttempts.push(now);
  attempts.set(identifier, validAttempts);
}
```

## Implementation Schedule

### Week 1

- **Day 1-2**: Fix sales volume tracking and set up Prisma properly
  - Run `prisma db pull` to generate schema from existing database
  - Create db-adapter abstraction layer
  - Fix the random sales volume calculation
- **Day 3**: Fix TypeScript errors and create Prisma models
  - Generate complete Prisma schema
  - Add Prisma types to existing functions
- **Day 4-5**: Migrate authentication module to Prisma
  - Start with read operations (getUserById, getUserByEmail)
  - Test with feature flags before full migration
- **Day 6-7**: Enhance session security and migrate orders module

### Week 2

- **Day 8-9**: Implement Prisma transactions for order+commission flow
  - Use Prisma's built-in transaction support
  - Keep Neon implementation as fallback
- **Day 10**: Migrate commission calculations to Prisma
  - Better type safety for commission calculations
  - Use Prisma's relation queries for upline chains
- **Day 11-12**: Complete remaining modules migration
  - Products, membership tiers, user points
  - Set up Prisma migrations for future changes
- **Day 13**: Performance testing and optimization
  - Compare Prisma vs Neon performance
  - Optimize Prisma queries with includes/selects
- **Day 14**: Final testing and gradual rollout

## Testing Checklist

### Unit Tests (Priority)

- [ ] Sales volume calculation
- [ ] Commission calculation
- [ ] User authentication
- [ ] Order creation workflow

### Integration Tests

- [ ] Full order + commission flow
- [ ] Payment processing
- [ ] User registration with referral

### Security Tests

- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF token validation
- [ ] Rate limiting effectiveness

## Prisma Migration Strategy

### Step-by-Step Migration Plan

**Week 1 - Foundation**:

```typescript
// 1. Create migration helper (lib/prisma-migration-helper.ts)
export class MigrationHelper {
  private prisma: PrismaClient;
  private neon: NeonClient;

  async migrateModule(moduleName: string) {
    console.log(`Starting migration for ${moduleName}`);

    // Compare data between Neon and Prisma
    const neonCount = await this.getNeonRecordCount(moduleName);
    const prismaCount = await this.getPrismaRecordCount(moduleName);

    if (neonCount !== prismaCount) {
      throw new Error(`Data mismatch in ${moduleName}`);
    }
  }
}

// 2. Feature flags for gradual rollout (.env)
USE_PRISMA = false;
USE_PRISMA_AUTH = false;
USE_PRISMA_ORDERS = false;
USE_PRISMA_COMMISSIONS = false;
USE_PRISMA_PRODUCTS = false;
```

**Week 2 - Module by Module**:

1. **Auth Module** (Most isolated, good starting point)
2. **Products Module** (Read-heavy, low risk)
3. **Orders Module** (Critical but well-defined)
4. **Commission Module** (Most complex, migrate last)

### Complete Prisma Schema Structure

```prisma
model User {
  id              Int                @id @default(autoincrement())
  email           String             @unique
  name            String?
  password        String
  role            String             @default("customer")
  profileImage    String?            @map("profile_image")
  createdAt       DateTime           @default(now()) @map("created_at")
  updatedAt       DateTime           @updatedAt @map("updated_at")

  // Relations
  orders          Order[]
  commissions     Commission[]       @relation("RecipientCommissions")
  createdCommissions Commission[]    @relation("UserCommissions")
  relationships   UserRelationship[] @relation("UserRelationships")
  uplineFor       UserRelationship[] @relation("UplineRelationships")
  points          UserPoints?
  membershipTier  MembershipTier?    @relation(fields: [membershipTierId], references: [id])
  membershipTierId Int?              @map("membership_tier_id")

  @@map("users")
}

model Order {
  id              Int              @id @default(autoincrement())
  userId          Int              @map("user_id")
  total           Decimal          @db.Decimal(10, 2)
  status          String           @default("pending")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  // Relations
  user            User             @relation(fields: [userId], references: [id])
  items           OrderItem[]
  commissions     Commission[]

  @@index([userId, status])
  @@map("orders")
}

// Continue with all other models...
```

## Deployment Considerations

1. **Database Migrations**:

   - Use Prisma migrations for schema changes
   - Keep Neon migrations as backup
   - Run `prisma migrate deploy` in production

2. **Environment Variables**: Add:

   - `SESSION_SECRET`: For secure sessions
   - `RATE_LIMIT_WINDOW_MS`: Rate limiting configuration
   - `SENTRY_DSN`: For error tracking
   - `USE_PRISMA_*`: Feature flags for each module
   - `DATABASE_URL`: Same for both Neon and Prisma

3. **Rollback Plan**:
   - Feature flags allow instant rollback
   - Keep Neon code for 30 days after migration
   - Monitor performance metrics closely
   - Have database backups before each module migration

## Success Metrics

- **Zero** random values in production code
- **100%** of TypeScript errors resolved
- **<200ms** average commission calculation time
- **Zero** commission calculation errors
- **95%+** API uptime
- All critical user flows have error handling

## Benefits of Prisma Migration

### Why Prisma Over Raw SQL

1. **Type Safety**: Full TypeScript support with auto-generated types
2. **Migration Management**: Version-controlled schema changes
3. **Better DX**: Autocomplete, validation, and error prevention
4. **Performance**: Query optimization and connection pooling built-in
5. **Maintainability**: Cleaner code, easier to understand

### Example: Commission Calculation Comparison

**Current Neon Implementation**:

```typescript
const uplines = await sql`
  WITH RECURSIVE upline_chain AS (
    SELECT * FROM user_relationships
    WHERE user_id = ${userId} AND upline_id IS NOT NULL
    UNION
    SELECT ur.* FROM user_relationships ur
    JOIN upline_chain uc ON ur.user_id = uc.upline_id
    WHERE ur.upline_id IS NOT NULL AND uc.relationship_level < ${maxLevels}
  )
  SELECT * FROM upline_chain
  ORDER BY relationship_level ASC
`;
```

**Prisma Implementation**:

```typescript
const uplines = await prisma.userRelationship.findMany({
  where: { userId },
  include: {
    upline: {
      include: {
        commissionTier: true,
        points: true,
      },
    },
  },
  orderBy: { relationshipLevel: 'asc' },
  take: maxLevels,
});
```

## Post-Implementation

After these 2 weeks:

1. Complete Prisma migration for remaining modules
2. Remove Neon dependencies (keep for 30 days as backup)
3. Implement Prisma-specific optimizations
4. Set up Prisma Studio for data exploration
5. Plan advanced features from original enhancement.md
