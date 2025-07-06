# DRY Principle Improvements

## Current Issues

### 1. Duplicated API Configuration and Error Handling
- **Files affected**: `order.actions.ts`, `webhook/hitpay/route.ts`
- **Issue**: Repeated base URL configuration and API token handling
- **Pattern**: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'`

### 2. Repeated Order Fetching Logic
- **Files affected**: `order.actions.ts` (multiple functions)
- **Functions**: `getMyOrdersAction()`, `getOrderAction()`, `getOrderByOrderNumberAction()`
- **Issue**: Duplicated Strapi query parameter building

### 3. Duplicated Error Response Structures
- **Files affected**: All action files
- **Pattern**: Similar error response objects throughout

### 4. Repeated HitPay Payment Verification Logic
- **Files affected**: `payment.actions.ts`, `payment/success/page.tsx`
- **Issue**: Similar payment verification patterns

### 5. Duplicated Form Validation Patterns
- **Files affected**: `checkout/page.tsx`
- **Issue**: Manual validation instead of using zod resolver

### 6. Repeated Cart Item Transformation
- **Files affected**: `checkout/page.tsx`, potentially other cart files
- **Issue**: Similar cart item transformation logic

### 7. Console Logging Patterns
- **Files affected**: All files
- **Issue**: Inconsistent logging with repeated patterns

### 8. Order Status Update Logic
- **Files affected**: `order.actions.ts`, `webhook/hitpay/route.ts`
- **Issue**: Similar status update patterns

## Refactoring Options

### Option 1: Quick Wins (1-2 hours)
**Tasks:**
1. Create shared API utilities (`lib/api-utils.ts`)
2. Extract cart transformations (`lib/cart-utils.ts`)
3. Basic logging utility (`lib/logger.ts`)

**Benefits:** Immediate reduction in duplication, low risk

### Option 2: Comprehensive Refactor (4-6 hours)
**Tasks:**
1. Everything from Option 1, plus:
2. Consolidate order operations (`lib/order-utils.ts`)
3. Payment abstraction (`lib/payment-utils.ts`)
4. Form validation library (`lib/validation.ts`)
5. API client wrapper (`lib/strapi-client.ts`)

**Benefits:** Clean, maintainable codebase

### Option 3: Incremental Improvement (Ongoing)
**Phase 1:** Extract API config and error handling
**Phase 2:** Consolidate order-related functions
**Phase 3:** Abstract payment logic

**Benefits:** Low risk, fits into normal workflow

### Option 4: Architectural Redesign (8-12 hours)
**Major Changes:**
1. Repository Pattern for data access
2. Service Layer for business logic
3. Unified Error Handling
4. Type-safe API Client

**Benefits:** Professional-grade architecture

## Recommended Approach

Start with Option 1 + selective items from Option 2:

1. **Immediate**:
   - Create `lib/api-utils.ts` for API config
   - Create `lib/response-utils.ts` for standardized responses
   - Extract cart transformations

2. **Next Sprint**:
   - Consolidate order query logic
   - Fix checkout form validation
   - Add basic logging utility

3. **Future**:
   - Consider payment abstraction if adding more payment providers
   - Evaluate need for architectural changes based on growth

## Code Examples

### Example: API Utils
```typescript
// lib/api-utils.ts
export const getApiConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337',
  token: process.env.STRAPI_API_TOKEN,
});

export const buildOrderQueryParams = () => {
  const params = new URLSearchParams();
  params.append('populate[user][fields]', 'id,username,email');
  params.append('populate[items][populate]', 'product');
  return params;
};
```

### Example: Response Utils
```typescript
// lib/response-utils.ts
export const createErrorResponse = (error: any, defaultMessage: string) => ({
  success: false,
  error: error?.message || defaultMessage,
});

export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  ...data,
});
```

### Example: Cart Utils
```typescript
// lib/cart-utils.ts
export const transformCartItemsForPayment = (items: CartItem[]) => 
  items.map(item => ({
    name: item.product?.name || `Product ${item.productId}`,
    price: item.product?.price || item.price || 0,
    quantity: item.quantity,
    productId: String(item.productId),
    image: item.product?.imageUrl || undefined,
    discount: item.discount || 0,
  }));
```

### Example: Logger
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  webhook: (message: string, data?: any) => console.log(`=== WEBHOOK: ${message} ===`, data),
};
```