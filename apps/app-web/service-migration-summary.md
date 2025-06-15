# Service Migration Summary

## Overview
All services in `app-web` have been updated to work with the new `apiClient` that returns data directly instead of wrapped in `ApiResponse`.

## Changes Made

### Services Extending BaseService
1. **auth.service.ts** - Removed all `extractData()` calls
2. **product.service.ts** - Removed all `extractData()` calls

### Services NOT Extending BaseService
1. **cart.service.ts** - Removed all `.success` checks and direct data access
2. **category.service.ts** - Removed all `.success` checks and direct data access
3. **commission.service.ts** - Removed all `.success` checks and direct data access
4. **dashboard.service.ts** - Removed all `.success` checks and direct data access
5. **membership.service.ts** - Removed all `.success` checks and direct data access (with special handling for "No membership found" case)
6. **order.service.ts** - Removed all `.success` checks and direct data access
7. **partner.service.ts** - Removed all `.success` checks and direct data access
8. **profile.service.ts** - Removed all `.success` checks and direct data access (fixed axios delete config)
9. **promotion.service.ts** - Removed all `.success` checks and direct data access
10. **user.service.ts** - Removed all `.success` checks and direct data access

### Already Correct
1. **ai.service.ts** - Already using direct returns without `.success` checks

## Key Pattern Changes

### Before:
```typescript
const response = await apiClient.get<SomeType>(url);
if (!response.success || !response.data) {
  throw new Error(response.error?.message || 'Error message');
}
return response.data;
```

### After:
```typescript
return await apiClient.get<SomeType>(url);
```

### Special Cases:
1. **membership.service.ts** - `getCurrentMembership()` method needs try-catch to handle "No membership found" case
2. **profile.service.ts** - `deleteAccount()` method had incorrect axios config (changed `body` to `data`)

## Notes
- The `apiClient` now handles all error cases internally and returns data directly
- Error handling is done through Promise rejection in the axios interceptor
- All services now have cleaner, more concise code without redundant error checking