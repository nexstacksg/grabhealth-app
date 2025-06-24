# Strapi Migration Plan - From Express.js to Strapi CMS

## Overview
Complete migration from Express.js backend (app-be) to Strapi CMS for all API functionality.

## Current Architecture Analysis

### Express.js Backend (app-be)
- **Framework**: Express.js 5.1.0 + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies, refresh tokens
- **Key Features**:
  - Multi-level marketing (MLM) commission system
  - Complex role-based pricing (Customer, Sales, Leader, Manager, Company)
  - Partner/clinic booking system
  - AI integration (OpenAI)
  - File uploads (S3/local)
  - Redis caching
  - Email notifications (Mailgun)
- **User Roles**: USER, MANAGER, SUPER_ADMIN (to be mapped to Strapi's Authenticated and Manager roles)

### Current API Structure
```
/api/v1/
├── auth/          # Registration, login, email verification
├── products/      # Product catalog with tiered pricing
├── orders/        # Order management with commission calculation
├── commissions/   # MLM network and commission tracking
├── users/         # User management and relationships
├── bookings/      # Partner clinic appointments
├── memberships/   # Membership tiers
├── cart/          # Shopping cart (Redis-based)
└── ai/            # AI recommendations
```

## Impact Analysis

### Major Changes Required

1. **API Endpoints**
   - All endpoints change from `/api/v1/*` to Strapi format `/api/*`
   - Response format changes to Strapi's data/meta structure
   - Query parameters change (filters, populate, etc.)

2. **Authentication**
   - From JWT in httpOnly cookies to Strapi JWT in Authorization header
   - Email verification flow needs reimplementation
   - Refresh token mechanism changes
   - Role mapping: USER → Authenticated, MANAGER → Manager, SUPER_ADMIN → Strapi Admin Panel

3. **Business Logic Migration**
   - Complex commission calculations based on sales position:
     - Direct sales: 30% commission (when you sell directly)
     - Level 2 upline: 10% commission (when your downline sells)
     - Level 3 upline: 5% commission (when your downline's downline sells)
   - Role-based pricing matrix (pricing tiers for different business roles)
   - Network relationship tracking (upline/downline structure)
   - Points/PV value calculations

4. **Database Schema**
   - Strapi uses different table naming (uses singular names)
   - Relations handled differently
   - Strapi adds system tables

5. **Frontend Updates Required**
   - app-web: Update all API calls, auth flow
   - app-admin: Update dashboard APIs
   - app-mobile: Update mobile app integration
   - shared-types: Regenerate all TypeScript types

## Migration Phases

### Phase 1: Strapi Setup & Configuration (Week 1)

- [ ] Install and configure Strapi with PostgreSQL
- [ ] Setup development environment
- [ ] Configure CORS for all frontend apps
- [ ] Setup file upload (Cloudinary/S3)
- [ ] Configure email provider (Mailgun)
- [ ] Setup Redis for caching
- [ ] Create base project structure

### Phase 2: Core Content Types (Week 2-3)

- [ ] **User Model Extension**
  - [ ] Add custom fields: firstName, lastName, referralCode, uplineId
  - [ ] Configure Strapi roles: Authenticated (default users), Manager
  - [ ] Add partner relationship
  - [ ] Setup user status field

- [ ] **Product Content Type**
  - [ ] Basic fields: name, description, SKU, imageUrl
  - [ ] Add ProductPricing relation
  - [ ] Add ProductCommissionTier relation
  - [ ] Category relationship

- [ ] **Order Management**
  - [ ] Order content type with status workflow
  - [ ] OrderItem with quantity and pricing
  - [ ] Payment tracking fields

### Phase 3: Complex Relations (Week 4-5)

- [ ] **MLM Relationships**
  - [ ] UserRelationship model for upline/downline
  - [ ] Commission tracking model
  - [ ] Network depth calculations (up to 4 levels)

- [ ] **Membership System**
  - [ ] MembershipTier content type
  - [ ] UserMembership with dates and status
  - [ ] Benefits and pricing

- [ ] **Partner System**
  - [ ] Partner/clinic content type
  - [ ] Service offerings
  - [ ] Availability scheduling
  - [ ] Booking management

### Phase 4: Business Logic Implementation (Week 6-8)

- [ ] **Commission Calculation Plugin**
  - [ ] Create custom Strapi plugin
  - [ ] Implement commission rates by sales position:
    - [ ] 30% for direct sales (level 1)
    - [ ] 10% for level 2 upline
    - [ ] 5% for level 3 upline
  - [ ] Calculate based on sale relationships, not user roles
  - [ ] Handle multi-level distribution through upline chain
  - [ ] PV points calculation

- [ ] **Pricing Service**
  - [ ] Role-based pricing matrix
  - [ ] Dynamic price calculation
  - [ ] Discount logic

- [ ] **Network Service**
  - [ ] Upline chain traversal
  - [ ] Network visualization data
  - [ ] Performance optimization

### Phase 5: API Customization (Week 9-10)

- [ ] **Custom Controllers**
  - [ ] Commission processing
  - [ ] Bulk order operations
  - [ ] Network analytics
  - [ ] Custom reports

- [ ] **Lifecycle Hooks**
  - [ ] Order completion -> Commission generation
  - [ ] User registration -> Referral code
  - [ ] Membership updates

- [ ] **Custom Routes**
  - [ ] `/api/commission/calculate`
  - [ ] `/api/network/visualization`
  - [ ] `/api/orders/bulk-process`

### Phase 6: Authentication & Security (Week 11)

- [ ] **Authentication Setup**
  - [ ] Configure JWT settings
  - [ ] Implement refresh token strategy
  - [ ] Email verification with 4-digit codes
  - [ ] Password reset flow

- [ ] **Security Configuration**
  - [ ] API rate limiting
  - [ ] Configure Strapi role permissions (Authenticated, Manager)
  - [ ] Field-level permissions for sensitive data
  - [ ] File upload restrictions

### Phase 7: Data Migration (Week 12)

- [ ] **Migration Scripts**
  - [ ] Export current data
  - [ ] Transform to Strapi schema
  - [ ] Handle relations mapping
  - [ ] Preserve user passwords
  - [ ] Maintain referral chains

- [ ] **Verification**
  - [ ] Commission calculations
  - [ ] User relationships
  - [ ] Order history
  - [ ] File references

### Phase 8: Frontend Integration (Week 13-14)

- [ ] **app-web Updates**
  - [ ] Update API client to handle Strapi format
  - [ ] Modify authentication flow
  - [ ] Update TypeScript types
  - [ ] Test all features

- [ ] **app-admin Updates**
  - [ ] Dashboard API integration
  - [ ] Admin authentication
  - [ ] Report generation

- [ ] **app-mobile Updates**
  - [ ] Mobile API client
  - [ ] Authentication handling
  - [ ] Offline support

### Phase 9: Testing & Optimization (Week 15)

- [ ] **Testing**
  - [ ] Commission calculation accuracy
  - [ ] Performance testing
  - [ ] Load testing
  - [ ] Security testing

- [ ] **Optimization**
  - [ ] Database query optimization
  - [ ] Caching strategy
  - [ ] API response time

### Phase 10: Deployment (Week 16)

- [ ] **Production Setup**
  - [ ] Deploy Strapi
  - [ ] Database migration
  - [ ] Environment configuration
  - [ ] Monitoring setup

- [ ] **Rollout Strategy**
  - [ ] Feature flags
  - [ ] Gradual migration
  - [ ] Rollback plan

## Critical Considerations

### Complex Features Requiring Special Attention

1. **Commission Calculation**
   - Must maintain exact calculation logic based on sales position
   - A user can earn different commission rates depending on their position in the sale:
     - As direct seller: 30%
     - As upline (level 2): 10%
     - As upline (level 3): 5%
   - Performance for large networks
   - Accurate distribution to multiple levels

2. **Role-Based Pricing**
   - Price matrix by user role
   - Real-time calculation
   - Consistency across apps

3. **Network Relationships**
   - Maintain upline/downline integrity
   - Efficient tree traversal
   - Visualization performance

### Risk Mitigation

1. **Parallel Running**
   - Keep Express.js running initially
   - Gradual API migration
   - A/B testing approach

2. **Data Integrity**
   - Regular backups
   - Verification scripts
   - Rollback procedures

3. **Performance**
   - Monitor query performance
   - Implement caching early
   - Optimize complex queries

## Success Criteria

- [ ] All API endpoints migrated
- [ ] Commission calculations accurate
- [ ] No data loss
- [ ] Performance equal or better
- [ ] All apps functioning correctly
- [ ] Zero downtime migration

## Notes

- Current Strapi instance already exists at `apps/app-strapi`
- Need to evaluate if Strapi can handle complex MLM calculations efficiently
- Consider hybrid approach for performance-critical features
- May need custom plugins for complex business logic