# Shared Types Migration Guide

## Architecture Overview

```
📁 packages/shared-types/
├── 📁 src/
│   ├── 📁 generated/          # Auto-generated from Prisma (DON'T EDIT)
│   │   └── prisma-types.ts    # Base types from database schema
│   ├── 📁 extensions/         # Frontend/Backend specific extensions
│   │   ├── frontend.ts        # UI-specific extensions
│   │   └── backend.ts         # API-specific extensions
│   ├── 📁 legacy/            # Current types (to be migrated)
│   └── index.ts              # Main exports
└── 📁 scripts/
    └── generate-from-prisma.ts # Auto-generation script
```

## Workflow

### 1. **When Database Schema Changes**
```bash
# In backend (app-be)
bun run prisma:migrate  # Apply migration to DB

# In shared-types  
bun run sync            # Regenerate types from new schema
```

### 2. **When Frontend Needs New Fields**
```typescript
// ❌ DON'T modify generated types
// ✅ DO extend in frontend extensions

// packages/shared-types/src/extensions/frontend.ts
export interface IProductWithUI extends IProduct {
  isInCart?: boolean;      // Add UI-only field
  formattedPrice: string;  // Add computed field
}
```

### 3. **Import Strategy**

```typescript
// Frontend components
import { IProductWithUI } from '@app/shared-types/extensions/frontend';

// Backend services  
import { IProduct } from '@app/shared-types'; // Use base Prisma type

// API responses (when you need joined data)
import { IProductResponse } from '@app/shared-types/extensions/frontend';
```

## Migration Steps

### Phase 1: Setup Generation (Week 1)
1. ✅ Create auto-generation scripts
2. ✅ Setup extension pattern  
3. ✅ Add sync commands

### Phase 2: Migrate Core Types (Week 2)
1. Replace `IUser` with auto-generated version
2. Replace `IProduct` with auto-generated version  
3. Replace `IOrder` with auto-generated version

### Phase 3: Frontend Extensions (Week 3)
1. Move UI-specific logic to extensions
2. Update import statements
3. Remove legacy type definitions

### Phase 4: Validation (Week 4)
1. Ensure all builds pass
2. Test type safety
3. Document new patterns

## Rules

### ✅ DO
- Always sync after Prisma schema changes
- Extend types in `extensions/` folder for additional fields
- Use base Prisma types in backend services
- Use extended types in frontend components

### ❌ DON'T
- Edit files in `generated/` folder
- Duplicate type definitions
- Use `any` types as shortcuts
- Mix base and extended types unnecessarily

## Commands

```bash
# Sync types with current Prisma schema
bun run sync

# Generate only (without build)
bun run generate:prisma  

# Development with auto-regeneration
bun run dev
```