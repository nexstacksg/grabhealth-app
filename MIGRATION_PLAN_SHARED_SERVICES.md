# Migration Plan: Moving app-web Services to Shared-Services Package

## Executive Summary

This document outlines a comprehensive plan to migrate the current app-web services to a new shared-services package following the adapter pattern architecture demonstrated in the app-template repository. This migration will enable code reuse across web, admin, and mobile applications while maintaining flexibility for platform-specific implementations.

## Goals & Benefits

### Primary Goals
1. **Code Reusability**: Share business logic across all applications (web, admin, mobile)
2. **Consistent Business Rules**: Centralize authorization and validation logic
3. **Type Safety**: Leverage TypeScript for compile-time safety across all platforms
4. **Maintainability**: Single source of truth for business logic
5. **Testability**: Isolated business logic that's easier to unit test

### Key Benefits
- Reduced code duplication (estimated 60-70% reduction)
- Consistent behavior across all platforms
- Faster feature development (write once, use everywhere)
- Easier maintenance and bug fixes
- Better separation of concerns

## Architecture Overview

### Package Structure
```
packages/shared-services/
├── src/
│   ├── index.ts                    # Main export file
│   ├── types/                      # Service-specific types
│   │   └── index.ts
│   ├── interfaces/                 # Data source interfaces
│   │   ├── IAuthDataSource.ts
│   │   ├── IProductDataSource.ts
│   │   ├── IOrderDataSource.ts
│   │   └── ...
│   ├── adapters/                   # Data source implementations
│   │   ├── prisma/                 # Backend adapters
│   │   │   ├── PrismaAuthDataSource.ts
│   │   │   ├── PrismaProductDataSource.ts
│   │   │   └── ...
│   │   ├── api/                    # Frontend adapters
│   │   │   ├── ApiAuthDataSource.ts
│   │   │   ├── ApiProductDataSource.ts
│   │   │   └── ...
│   │   └── mock/                   # Testing adapters
│   │       └── MockDataSources.ts
│   ├── services/                   # Business logic services
│   │   ├── AuthService.ts
│   │   ├── ProductService.ts
│   │   ├── CartService.ts
│   │   ├── OrderService.ts
│   │   ├── CommissionService.ts
│   │   ├── CategoryService.ts
│   │   ├── MembershipService.ts
│   │   ├── ProfileService.ts
│   │   ├── PromotionService.ts
│   │   ├── DashboardService.ts
│   │   ├── PartnerService.ts
│   │   └── AIService.ts
│   └── utils/                      # Shared utilities
│       ├── validation.ts
│       ├── errors.ts
│       └── helpers.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Service Migration Strategy

### Phase 1: Foundation (Week 1)
1. **Create Package Structure**
   - Set up shared-services package
   - Configure TypeScript and build process
   - Set up testing framework

2. **Define Core Interfaces**
   - Create base `IDataSource` interface
   - Define service-specific data source interfaces
   - Establish error handling patterns

3. **Implement Base Infrastructure**
   - Create base service class with common functionality
   - Implement error handling utilities
   - Set up validation helpers

### Phase 2: Core Services (Week 2-3)
Migrate services in order of dependency:

1. **AuthService** (High Priority)
   - Most fundamental service
   - Required by most other services
   - Includes: login, register, profile, token management

2. **ProductService** (High Priority)
   - Core e-commerce functionality
   - No complex dependencies
   - Includes: search, categories, featured products

3. **CartService** (Medium Priority)
   - Depends on Product and Auth
   - Session-based for guests
   - Includes: add, update, remove, sync

4. **OrderService** (Medium Priority)
   - Depends on Cart, Product, Auth
   - Complex business logic
   - Includes: checkout, history, cancellation

### Phase 3: Advanced Services (Week 4-5)
5. **CommissionService** (High Complexity)
   - Complex MLM calculations
   - Network visualization logic
   - Includes: calculations, network, statistics

6. **MembershipService** (Medium Complexity)
   - Tier management
   - Upgrade eligibility logic
   - Includes: tiers, upgrades, benefits

7. **PromotionService** (Medium Complexity)
   - Validation logic
   - Cart integration
   - Includes: coupons, validation, application

### Phase 4: Support Services (Week 6)
8. **CategoryService**
9. **ProfileService**
10. **DashboardService**
11. **PartnerService**
12. **AIService** (Special consideration for API keys)

## Data Source Implementations

### 1. Prisma Data Sources (Backend)
```typescript
// Example: PrismaProductDataSource
export class PrismaProductDataSource implements IProductDataSource {
  constructor(private prisma: PrismaClient) {}
  
  async getProducts(filters: ProductFilters): Promise<IProduct[]> {
    return this.prisma.product.findMany({
      where: this.buildWhereClause(filters),
      include: { category: true, images: true }
    });
  }
}
```

### 2. API Data Sources (Frontend)
```typescript
// Example: ApiProductDataSource
export class ApiProductDataSource implements IProductDataSource {
  constructor(
    private apiUrl: string,
    private getToken: () => Promise<string | null>
  ) {}
  
  async getProducts(filters: ProductFilters): Promise<IProduct[]> {
    const response = await fetch(`${this.apiUrl}/products`, {
      headers: await this.buildHeaders(),
      body: JSON.stringify(filters)
    });
    return this.handleResponse(response);
  }
}
```

### 3. Mock Data Sources (Testing)
```typescript
// Example: MockProductDataSource
export class MockProductDataSource implements IProductDataSource {
  private products: IProduct[] = mockProducts;
  
  async getProducts(filters: ProductFilters): Promise<IProduct[]> {
    return this.products.filter(p => this.matchesFilters(p, filters));
  }
}
```

## Authorization Strategy

### Role-Based Access Control (RBAC)
```typescript
// Centralized in services
class ProductService {
  async updateProduct(
    productId: string,
    data: IUpdateProduct,
    user: IUserContext
  ): Promise<IProduct> {
    // Authorization check
    if (!this.canManageProducts(user)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    
    return this.dataSource.updateProduct(productId, data);
  }
  
  private canManageProducts(user: IUserContext): boolean {
    return user.role === UserRole.SUPER_ADMIN || 
           user.role === UserRole.MANAGER;
  }
}
```

### Service-Level Security
- All authorization logic in service layer
- Data sources remain authorization-agnostic
- Consistent security across all platforms

## Integration Examples

### Backend (Express)
```typescript
// In Express controller
const productService = new ProductService({
  dataSource: new PrismaProductDataSource(prisma)
});

router.get('/products', async (req, res) => {
  const products = await productService.searchProducts(req.query);
  res.json(products);
});
```

### Frontend (Next.js)
```typescript
// In Next.js API route or component
const productService = new ProductService({
  dataSource: new ApiProductDataSource(
    process.env.NEXT_PUBLIC_API_URL,
    async () => cookies().get('token')?.value
  )
});

export async function getProducts(filters: ProductFilters) {
  return productService.searchProducts(filters);
}
```

### Mobile (React Native)
```typescript
// In React Native
const productService = new ProductService({
  dataSource: new ApiProductDataSource(
    Config.API_URL,
    async () => AsyncStorage.getItem('token')
  )
});

const products = await productService.searchProducts({ category: 'health' });
```

## Testing Strategy

### Unit Tests
```typescript
describe('ProductService', () => {
  let service: ProductService;
  let mockDataSource: MockProductDataSource;
  
  beforeEach(() => {
    mockDataSource = new MockProductDataSource();
    service = new ProductService({ dataSource: mockDataSource });
  });
  
  test('should filter products by category', async () => {
    const products = await service.searchProducts({ category: 'health' });
    expect(products).toHaveLength(3);
    expect(products.every(p => p.category === 'health')).toBe(true);
  });
});
```

### Integration Tests
- Test actual Prisma data sources with test database
- Test API data sources with mock server
- End-to-end testing across platforms

## Migration Checklist

### For Each Service:
- [ ] Define data source interface
- [ ] Implement Prisma adapter (backend)
- [ ] Implement API adapter (frontend)
- [ ] Implement mock adapter (testing)
- [ ] Migrate business logic to service
- [ ] Add authorization checks
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update backend to use service
- [ ] Update frontend to use service
- [ ] Update mobile to use service (if applicable)
- [ ] Update documentation

## Breaking Changes & Compatibility

### Minimal Breaking Changes
- Services will maintain same method signatures
- Return types remain consistent with current implementation
- Error handling patterns preserved

### Gradual Migration Path
1. Create shared-services alongside existing services
2. Migrate one service at a time
3. Run both implementations in parallel during transition
4. Remove old implementation after verification

## Performance Considerations

### Caching Strategy
```typescript
class CachedProductService extends ProductService {
  private cache: Map<string, CacheEntry> = new Map();
  
  async getProduct(id: string): Promise<IProduct> {
    const cached = this.cache.get(id);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    const product = await super.getProduct(id);
    this.cache.set(id, { data: product, timestamp: Date.now() });
    return product;
  }
}
```

### Bundle Size Optimization
- Tree-shaking friendly exports
- Separate entry points for different platforms
- Lazy loading for heavy services (AI, Dashboard)

## Success Metrics

### Quantitative Metrics
- **Code Reduction**: Target 60-70% less duplicated code
- **Test Coverage**: Achieve 90%+ coverage for services
- **Performance**: No regression in API response times
- **Bundle Size**: < 10% increase in frontend bundle

### Qualitative Metrics
- Faster feature development time
- Reduced bugs from inconsistent implementations
- Easier onboarding for new developers
- Improved code maintainability scores

## Risk Mitigation

### Technical Risks
1. **Risk**: Complex migration breaking existing functionality
   - **Mitigation**: Parallel implementation with feature flags
   
2. **Risk**: Performance degradation from abstraction
   - **Mitigation**: Performance testing at each phase
   
3. **Risk**: Increased bundle size for frontend
   - **Mitigation**: Code splitting and lazy loading

### Project Risks
1. **Risk**: Extended timeline affecting feature delivery
   - **Mitigation**: Phased approach, migrate critical services first
   
2. **Risk**: Team resistance to new architecture
   - **Mitigation**: Clear documentation and training sessions

## Next Steps

1. **Review and Approval**: Get team buy-in on architecture
2. **Set Up Package**: Create shared-services package structure
3. **Pilot Service**: Start with AuthService as proof of concept
4. **Team Training**: Workshop on new architecture patterns
5. **Begin Migration**: Follow phased approach outlined above

## Conclusion

This migration to a shared-services architecture will significantly improve code maintainability, reduce duplication, and ensure consistent business logic across all platforms. The phased approach minimizes risk while delivering value incrementally. With proper execution, this architecture will serve as a solid foundation for future growth and feature development.