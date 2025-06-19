# Dynamic Commission API Design

## Overview

This document outlines the design for a configurable, database-driven commission system that replaces hardcoded commission rates with dynamic, manageable configurations.

## Database Schema

### 1. Commission Tiers Table
```sql
CREATE TABLE commission_tiers (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL, -- 'Sales', 'Leader', 'Manager', 'Company'
  level INT NOT NULL, -- 1, 2, 3, 4
  default_percentage DECIMAL(5,2) NOT NULL,
  min_qualification_sales DECIMAL(10,2),
  min_downline_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Product Commission Rates Table
```sql
CREATE TABLE product_commission_rates (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  tier_id UUID NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL,
  price_override DECIMAL(10,2), -- Optional tier-specific pricing
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (tier_id) REFERENCES commission_tiers(id)
);
```

### 3. Commission Rules Table
```sql
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'BONUS', 'SEASONAL', 'VOLUME_BASED', 'PERFORMANCE'
  condition_json JSONB NOT NULL, -- Flexible conditions
  bonus_percentage DECIMAL(5,2),
  bonus_amount DECIMAL(10,2),
  priority INT DEFAULT 0,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Commission History Table
```sql
CREATE TABLE commission_history (
  id UUID PRIMARY KEY,
  tier_id UUID NOT NULL,
  product_id UUID,
  old_percentage DECIMAL(5,2) NOT NULL,
  new_percentage DECIMAL(5,2) NOT NULL,
  changed_by UUID NOT NULL,
  reason TEXT,
  changed_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (tier_id) REFERENCES commission_tiers(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

## API Endpoints

### 1. Commission Configuration Management

#### Get All Commission Tiers
```
GET /api/v1/admin/commission/tiers
Response: {
  tiers: [{
    id: "uuid",
    name: "Sales",
    level: 1,
    defaultPercentage: 30,
    minQualificationSales: 0,
    minDownlineCount: 0,
    isActive: true
  }]
}
```

#### Update Commission Tier
```
PUT /api/v1/admin/commission/tiers/:tierId
Body: {
  defaultPercentage: 25,
  minQualificationSales: 1000,
  reason: "Market adjustment Q1 2025"
}
```

#### Get Product Commission Rates
```
GET /api/v1/admin/commission/products/:productId/rates
Response: {
  productId: "uuid",
  rates: [{
    tierId: "uuid",
    tierName: "Sales",
    commissionPercentage: 30,
    priceOverride: 2520,
    effectiveDate: "2025-01-01",
    expiryDate: null
  }]
}
```

#### Set Product Commission Rate
```
POST /api/v1/admin/commission/products/:productId/rates
Body: {
  tierId: "uuid",
  commissionPercentage: 35,
  priceOverride: 2340,
  effectiveDate: "2025-02-01",
  expiryDate: "2025-12-31"
}
```

### 2. Commission Calculation API

#### Calculate Commission for Order
```
POST /api/v1/commission/calculate
Body: {
  orderId: "uuid",
  userId: "uuid",
  products: [{
    productId: "uuid",
    quantity: 2,
    salePrice: 3600
  }]
}

Response: {
  totalCommission: 2160,
  breakdown: [{
    userId: "uuid",
    userName: "John Doe",
    tier: "Sales",
    level: 1,
    commission: 1080,
    percentage: 30
  }, {
    userId: "uuid",
    userName: "Jane Smith",
    tier: "Leader",
    level: 2,
    commission: 360,
    percentage: 10
  }],
  appliedRules: [{
    ruleName: "Q1 Bonus",
    bonusAmount: 100
  }]
}
```

#### Get Commission Rate for User
```
GET /api/v1/commission/rates/user/:userId?productId=uuid
Response: {
  userId: "uuid",
  tier: "Sales",
  level: 1,
  products: [{
    productId: "uuid",
    productName: "Realman",
    commissionPercentage: 30,
    yourPrice: 2520,
    customerPrice: 3600,
    potentialCommission: 1080
  }]
}
```

### 3. Commission Rules Management

#### Create Commission Rule
```
POST /api/v1/admin/commission/rules
Body: {
  name: "Q1 2025 Sales Bonus",
  ruleType: "SEASONAL",
  conditions: {
    dateRange: {
      start: "2025-01-01",
      end: "2025-03-31"
    },
    minSalesAmount: 10000,
    applicableTiers: ["Sales", "Leader"]
  },
  bonusPercentage: 5,
  priority: 10
}
```

#### Get Active Rules
```
GET /api/v1/commission/rules/active?userId=uuid&date=2025-01-15
Response: {
  rules: [{
    id: "uuid",
    name: "Q1 2025 Sales Bonus",
    description: "Extra 5% for Q1 sales over $10,000",
    qualifies: true,
    bonusPercentage: 5
  }]
}
```

### 4. Commission History & Reporting

#### Get Commission History
```
GET /api/v1/admin/commission/history?startDate=2025-01-01&endDate=2025-01-31
Response: {
  changes: [{
    id: "uuid",
    tierName: "Sales",
    productName: "Realman",
    oldPercentage: 30,
    newPercentage: 35,
    changedBy: "Admin Name",
    reason: "Promotional increase",
    changedAt: "2025-01-15T10:00:00Z"
  }]
}
```

## Implementation Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Create database tables and migrations
2. Build admin APIs for commission tier management
3. Implement commission calculation engine
4. Add audit logging for all changes

### Phase 2: Product Integration (Week 3-4)
1. Link products to commission rates
2. Build product-specific commission APIs
3. Implement price calculation based on user tier
4. Create commission preview functionality

### Phase 3: Advanced Features (Week 5-6)
1. Implement commission rules engine
2. Add bonus and seasonal commission support
3. Build reporting and analytics
4. Create commission simulation tools

### Phase 4: Migration & Testing (Week 7-8)
1. Migrate existing hardcoded rates to database
2. Create data migration scripts
3. Comprehensive testing with edge cases
4. Performance optimization

## Configuration Examples

### Default Commission Structure
```json
{
  "tiers": [
    {
      "name": "Sales",
      "level": 1,
      "defaultPercentage": 30,
      "qualification": {
        "minSales": 0,
        "minDownlines": 0
      }
    },
    {
      "name": "Leader",
      "level": 2,
      "defaultPercentage": 10,
      "qualification": {
        "minSales": 5000,
        "minDownlines": 3
      }
    },
    {
      "name": "Manager",
      "level": 3,
      "defaultPercentage": 5,
      "qualification": {
        "minSales": 20000,
        "minDownlines": 10,
        "minLeaders": 2
      }
    },
    {
      "name": "Company",
      "level": 4,
      "defaultPercentage": 5,
      "qualification": "Partnership Agreement"
    }
  ]
}
```

### Product-Specific Override
```json
{
  "productId": "realman-uuid",
  "customRates": [
    {
      "tierId": "sales-tier-uuid",
      "percentage": 35,
      "reason": "Premium product higher margin"
    }
  ]
}
```

### Seasonal Rule Example
```json
{
  "name": "Chinese New Year Bonus",
  "type": "SEASONAL",
  "conditions": {
    "dateRange": {
      "start": "2025-01-29",
      "end": "2025-02-12"
    },
    "products": ["golden-ginseng-water"],
    "bonusType": "PERCENTAGE",
    "bonusValue": 8
  }
}
```

## Security Considerations

1. **Role-Based Access**:
   - Only Super Admins can modify commission structures
   - Managers can view but not modify
   - All changes require authentication and are logged

2. **Validation**:
   - Commission percentages must be between 0-100
   - Total commission cannot exceed product margin
   - Effective dates cannot be retroactive beyond 30 days

3. **Audit Trail**:
   - All commission changes are logged with timestamp
   - Changes require reason/justification
   - History is immutable and retained for 7 years

## Migration Plan

1. **Data Migration Script**:
```javascript
// Migrate current hardcoded rates
const currentRates = {
  'Sales': { percentage: 30, products: {...} },
  'Leader': { percentage: 10, products: {...} },
  'Manager': { percentage: 5, products: {...} },
  'Company': { percentage: 5, products: {...} }
};

// Insert into new tables with effective date
```

2. **Rollback Strategy**:
   - Keep hardcoded values as fallback
   - Feature flag for gradual rollout
   - Parallel calculation for verification

## Benefits

1. **Flexibility**: Change rates without code deployment
2. **Transparency**: Full audit trail of changes
3. **Scalability**: Support for complex commission structures
4. **Performance**: Cached calculations with Redis
5. **Analytics**: Better insights into commission costs
6. **Compliance**: Proper documentation for regulatory requirements

## Future Enhancements

1. **Multi-Currency Support**: Different rates for different markets
2. **Commission Caps**: Maximum commission limits
3. **Tiered Bonuses**: Volume-based progressive rates
4. **Commission Splitting**: Complex multi-party arrangements
5. **Automated Adjustments**: AI-based rate optimization
6. **Real-time Notifications**: Alert users of rate changes
7. **Commission Forecasting**: Predictive analytics

## Notes

- All percentages are stored as decimals (30% = 30.00)
- Prices are stored in smallest currency unit (cents)
- UTC timestamps for all date/time fields
- Consider implementing commission calculation as a microservice for scalability