# GrabHealth.ai Backend API

A comprehensive e-commerce backend API for GrabHealth.ai built with Node.js, Express, TypeScript, and Prisma. This backend provides a complete solution for health and wellness e-commerce with multi-level marketing (MLM) features, membership tiers, and promotional systems.

## Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Email verification
  - Password reset functionality
  - Role-based access control (SUPER_ADMIN, MANAGER, USER)
  - Rate limiting for security
  - Strong password policies

- **User Management**
  - User registration and login
  - Profile management
  - User CRUD operations
  - Audit logging
  - Referral system with upline tracking

- **E-Commerce Core**
  - Product catalog with categories
  - Shopping cart management
  - Order processing and tracking
  - Inventory management
  - Product search and filtering

- **Category Management**
  - Hierarchical category structure
  - Category sorting and reordering
  - Product categorization

- **Order Management**
  - Order creation and updates
  - Order status tracking
  - Payment status management
  - Order statistics and analytics

- **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Cart persistence
  - Guest cart to user cart sync

- **Multi-Level Marketing (MLM)**
  - 4-level commission system
  - Network visualization
  - Commission tracking and processing
  - Referral relationship management
  - Commission statistics and payouts

- **Membership System**
  - Free membership upon registration
  - Membership tracking and management
  - Auto-renewal management (for future paid tiers)
  - Membership statistics

- **Promotions & Discounts**
  - Percentage and fixed discounts
  - Date-based promotions
  - Minimum purchase requirements
  - Promotion code validation

- **Email Service**
  - Email verification
  - Password reset emails
  - Order confirmation emails
  - Configurable SMTP settings

- **Database**
  - Prisma ORM with SQLite (easily switchable to PostgreSQL, MySQL, etc.)
  - Database migrations
  - Type-safe database queries
  - Seed data for development

- **API Documentation**
  - Swagger/OpenAPI documentation
  - Interactive API testing interface

- **Security & Performance**
  - Password hashing with bcrypt
  - Hashed refresh tokens
  - Input validation with express-validator
  - Error handling middleware
  - CORS configuration
  - Rate limiting middleware
  - Structured logging with Winston
  - Redis caching for authentication and cart

- **Testing**
  - Jest test framework
  - Unit and integration tests
  - Test coverage reporting

- **Development Tools**
  - Docker Compose for Redis
  - Environment variable validation
  - Comprehensive error handling

## Tech Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Cache**: Redis (optional)
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Docker (for Redis, optional)
- SQLite (included by default)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd app-be
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="file:./dev.db"

# JWT (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Optional - for email functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@app.com

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

4. Start Redis (optional but recommended):
```bash
# Start Redis using Docker
bun run docker:start
# Or manually: docker-compose up -d
```

5. Generate Prisma client:
```bash
bun prisma generate
# or
npx prisma generate
```

6. Run database migrations:
```bash
bun prisma migrate dev
# or
npx prisma migrate dev
```

7. Seed the database (optional):
```bash
bun run prisma:seed
# or
npm run prisma:seed
```

8. Start the development server:
```bash
bun dev
# or
npm run dev
```

The API will be available at `http://localhost:4000`

## Quick Start - E-Commerce Setup

After completing the installation steps above:

1. **Create Product Categories**:
```bash
# Use the API to create categories
curl -X POST http://localhost:4000/api/v1/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic products"
  }'
```

2. **Add Products**:
```bash
# Create a product
curl -X POST http://localhost:4000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone",
    "price": 999.99,
    "categoryId": 1,
    "description": "Latest model smartphone"
  }'
```

3. **Set Up Membership**:
Membership is now free and automatically available upon user registration. No discounts are applied based on membership - pricing is determined by product levels and commission structure.

4. **Configure Commission Rates**:
Commission rates are pre-configured in the database seed:
- Level 1: 30% (Sales)
- Level 2: 10% (Leader)
- Level 3: 5% (Manager)
- Level 4: 5% (Company)

5. **Test the Shopping Flow**:
- Browse products: `GET /api/v1/products`
- Add to cart: `POST /api/v1/cart/add`
- Checkout: `POST /api/v1/orders/checkout`
- View orders: `GET /api/v1/orders/my-orders`

## Docker Services

### Redis Cache

Start Redis with Docker Compose:

```bash
# Start Redis only
bun run docker:start

# Start all development services (Redis + PostgreSQL + GUIs)
bun run docker:start-all

# Check service status
bun run docker:status

# View logs
bun run docker:logs

# Stop services
bun run docker:stop
```

**Available Services:**
- **Redis**: `localhost:6379` (caching)
- **Redis Commander**: `http://localhost:8081` (Redis GUI)
- **PostgreSQL**: `localhost:5432` (optional database)
- **pgAdmin**: `http://localhost:8082` (PostgreSQL GUI)

See [DOCKER.md](./DOCKER.md) for detailed Docker usage instructions.

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
bun prisma generate

# Create a new migration
bun prisma migrate dev --name <migration_name>

# Apply pending migrations in production
bun prisma migrate deploy

# Reset database (drops all data!)
bun prisma migrate reset

# Open Prisma Studio (GUI for database)
bun prisma studio

# Seed the database
bun run prisma:seed
```

### Migration Workflow

1. **Modify schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `bun prisma migrate dev --name add_user_field`
3. **Generate client**: Automatically happens after migration
4. **Update code**: Use the new fields in your TypeScript code

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch
```

### Test Structure

- **Unit Tests**: `src/__tests__/unit/` - Test individual functions and utilities
- **Integration Tests**: `src/__tests__/integration/` - Test API endpoints
- **Setup**: `src/__tests__/setup.ts` - Test configuration and mocks

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:4000/api-docs
```

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Configuration files
│   ├── env.ts               # Environment validation
│   ├── jwt.ts               # JWT configuration
│   └── swagger.ts           # Swagger configuration
├── controllers/              # Route controllers
│   ├── auth/                # Authentication controllers
│   ├── cart/                # Shopping cart controllers
│   ├── category/            # Category management controllers
│   ├── commission/          # Commission controllers
│   ├── membership/          # Membership controllers
│   ├── order/               # Order management controllers
│   ├── product/             # Product controllers
│   ├── promotion/           # Promotion controllers
│   └── user/                # User management controllers
├── database/                 # Database configuration
│   ├── client.ts            # Prisma client instance
│   └── seed.ts              # Database seed script
├── middleware/              # Express middleware
│   ├── auth/                # Authentication middleware
│   ├── error/               # Error handling middleware
│   ├── security/            # Security middleware (rate limiting)
│   └── validation/          # Request validation
├── routes/                  # API routes
│   └── api/v1/              # Version 1 API routes
│       ├── auth.ts          # Authentication routes
│       ├── cart.ts          # Cart routes
│       ├── categories.ts    # Category routes
│       ├── commissions.ts   # Commission routes
│       ├── memberships.ts   # Membership routes
│       ├── orders.ts        # Order routes
│       ├── products.ts      # Product routes
│       ├── promotions.ts    # Promotion routes
│       └── users.ts         # User routes
├── services/                # Business logic
│   ├── auth/                # Authentication services
│   ├── cache.ts             # Cache service
│   ├── cart.service.ts      # Shopping cart service
│   ├── category.service.ts  # Category management service
│   ├── commission.service.ts # Commission calculation service
│   ├── membership.service.ts # Membership management service
│   ├── order.service.ts     # Order processing service
│   ├── product.service.ts   # Product management service
│   ├── promotion.service.ts # Promotion management service
│   └── user/                # User services
├── utils/                   # Utility functions
│   ├── auth.ts              # Authentication utilities
│   ├── email.ts             # Email utilities
│   └── logger.ts            # Structured logging
└── __tests__/               # Test files
    ├── setup.ts             # Test configuration
    ├── unit/                # Unit tests
    └── integration/         # Integration tests
```

## Available Scripts

### Development
- `bun dev` - Start development server with hot reload
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun format` - Format code with Prettier

### Database
- `bun prisma:generate` - Generate Prisma client
- `bun prisma:migrate` - Run database migrations
- `bun prisma:studio` - Open Prisma Studio GUI
- `bun prisma:seed` - Seed database with sample data

### Testing
- `bun test` - Run all tests
- `bun test:unit` - Run unit tests
- `bun test:integration` - Run integration tests
- `bun test:coverage` - Run tests with coverage
- `bun test:watch` - Run tests in watch mode

### Docker
- `bun docker:start` - Start Redis
- `bun docker:start-all` - Start all services
- `bun docker:stop` - Stop Redis
- `bun docker:status` - Check service status
- `bun docker:logs` - View service logs

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (requires auth)
- `GET /api/v1/auth/profile` - Get current user profile (requires auth)
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users
- `GET /api/v1/users` - Get all users (requires auth)
- `POST /api/v1/users` - Create a new user (requires manager role)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `PUT /api/v1/users/:id` - Update user (requires auth)
- `DELETE /api/v1/users/:id` - Delete user (requires admin role)
- `PATCH /api/v1/users/:id/status` - Update user status (requires manager role)
- `PUT /api/v1/users/my-profile` - Update current user profile (requires auth)
- `POST /api/v1/users/change-password` - Change password (requires auth)

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/search` - Search products with filters
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/categories` - Get all product categories
- `GET /api/v1/products/category/:categoryId` - Get products by category
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Create product (requires manager role)
- `PUT /api/v1/products/:id` - Update product (requires manager role)
- `DELETE /api/v1/products/:id` - Delete product (requires admin role)
- `PATCH /api/v1/products/:id/stock` - Update stock status (requires manager role)

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/tree` - Get category hierarchy
- `GET /api/v1/categories/:id` - Get category details
- `POST /api/v1/categories` - Create category (requires manager role)
- `PUT /api/v1/categories/:id` - Update category (requires manager role)
- `DELETE /api/v1/categories/:id` - Delete category (requires admin role)
- `POST /api/v1/categories/reorder` - Reorder categories (requires manager role)

### Shopping Cart
- `GET /api/v1/cart` - Get current cart (requires auth)
- `POST /api/v1/cart/add` - Add item to cart (requires auth)
- `PUT /api/v1/cart/update` - Update cart item quantity (requires auth)
- `DELETE /api/v1/cart/item/:productId` - Remove item from cart (requires auth)
- `DELETE /api/v1/cart/clear` - Clear cart (requires auth)
- `POST /api/v1/cart/sync` - Sync guest cart with user cart (requires auth)

### Orders
- `GET /api/v1/orders` - Get all orders (requires manager role)
- `POST /api/v1/orders` - Create order (requires auth)
- `GET /api/v1/orders/my-orders` - Get user's orders (requires auth)
- `GET /api/v1/orders/stats` - Get order statistics (requires auth)
- `POST /api/v1/orders/checkout` - Checkout from cart (requires auth)
- `GET /api/v1/orders/:id` - Get order details (requires auth)
- `PUT /api/v1/orders/:id` - Update order (requires manager role)
- `POST /api/v1/orders/:id/cancel` - Cancel order (requires auth)

### Commissions
- `GET /api/v1/commissions/my-commissions` - Get user's commissions (requires auth)
- `GET /api/v1/commissions/stats` - Get commission statistics (requires auth)
- `GET /api/v1/commissions/network` - Get MLM network (requires auth)
- `GET /api/v1/commissions/network/stats` - Get network statistics (requires auth)
- `GET /api/v1/commissions/:id` - Get commission details (requires auth)
- `GET /api/v1/commissions/summary/all` - Get all commissions summary (requires admin role)
- `POST /api/v1/commissions/process` - Process pending commissions (requires admin role)

### Memberships
- `GET /api/v1/memberships/tiers` - Get membership tiers
- `GET /api/v1/memberships/tiers/:id` - Get tier details
- `GET /api/v1/memberships/my-membership` - Get user's membership (requires auth)
- `POST /api/v1/memberships/subscribe` - Subscribe to membership (requires auth)
- `POST /api/v1/memberships/cancel` - Cancel membership (requires auth)
- `PATCH /api/v1/memberships/auto-renew` - Update auto-renewal (requires auth)
- `POST /api/v1/memberships/tiers` - Create tier (requires admin role)
- `PUT /api/v1/memberships/tiers/:id` - Update tier (requires admin role)
- `GET /api/v1/memberships/users` - Get all user memberships (requires manager role)
- `GET /api/v1/memberships/stats` - Get membership statistics (requires manager role)
- `POST /api/v1/memberships/process-expired` - Process expired memberships (requires admin role)

### Promotions
- `GET /api/v1/promotions/active` - Get active promotions
- `POST /api/v1/promotions/validate` - Validate promotion code
- `GET /api/v1/promotions` - Get all promotions (requires manager role)
- `GET /api/v1/promotions/stats` - Get promotion statistics (requires manager role)
- `GET /api/v1/promotions/:id` - Get promotion details (requires manager role)
- `POST /api/v1/promotions` - Create promotion (requires manager role)
- `PUT /api/v1/promotions/:id` - Update promotion (requires manager role)
- `DELETE /api/v1/promotions/:id` - Delete promotion (requires admin role)
- `PATCH /api/v1/promotions/:id/toggle` - Toggle promotion status (requires manager role)

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Account Creation**: 3 accounts per hour per IP
- **Password Reset**: 3 requests per hour per IP
- **Email Verification**: 5 requests per hour per IP

### Password Policy
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Blacklisted common passwords
- Different from previous password

### Token Security
- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry, hashed in database
- Secure token generation with crypto module

### Caching Strategy
- User authentication data cached for 5 minutes
- Cache invalidation on logout and profile updates
- Graceful degradation when Redis unavailable

## Test Credentials

After running the seed script, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | super.admin@example.com | NewPass@123 |
| Manager | manager@example.com | NewPass@123 |
| User | user1@example.com | NewPass@123 |
| User | user2@example.com | NewPass@123 |
| User (Unverified) | user3@example.com | NewPass@123 |

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment (development/production/test) | No | development |
| PORT | Server port | No | 4000 |
| DATABASE_URL | Database connection string | Yes | - |
| JWT_SECRET | Secret key for JWT tokens (min 32 chars) | Yes | - |
| JWT_EXPIRES_IN | Access token expiry | No | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | No | 7d |
| SMTP_HOST | Email SMTP host | No | - |
| SMTP_PORT | Email SMTP port | No | 587 |
| SMTP_USER | SMTP username | No | - |
| SMTP_PASS | SMTP password | No | - |
| EMAIL_FROM | From email address | No | noreply@app.com |
| CORS_ORIGIN | Allowed CORS origins | No | * |
| REDIS_URL | Redis connection URL | No | - |
| FRONTEND_URL | Frontend application URL | No | http://localhost:3001 |
| ADMIN_URL | Admin panel URL | No | http://localhost:3002 |

## Database Schema

### Core Models

#### User Model
```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  firstName              String
  lastName               String
  profilePhoto           String?
  role                   String    @default("USER")
  status                 String    @default("PENDING_VERIFICATION")
  refreshToken           String?   // Hashed for security
  lastLoginAt            DateTime?
  emailVerificationToken String?
  emailVerifiedAt        DateTime?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  
  // E-commerce relations
  orders                 Order[]
  membership             UserMembership?
  commissions            Commission[]
  referrals              UserRelationship[]
}
```

#### Product Model
```prisma
model Product {
  id                Int      @id @default(autoincrement())
  name              String
  description       String?
  price             Float
  discountEssential Float    @default(0.10)
  discountPremium   Float    @default(0.25)
  categoryId        Int?
  imageUrl          String?
  inStock           Boolean  @default(true)
  status            String   @default("ACTIVE")
  
  // Relations
  category          Category?
  orderItems        OrderItem[]
}
```

#### Order Model
```prisma
model Order {
  id              Int      @id @default(autoincrement())
  userId          String
  total           Float
  subtotal        Float
  discount        Float
  status          String   @default("PENDING")
  paymentStatus   String   @default("PENDING")
  paymentMethod   String?
  shippingAddress String?
  billingAddress  String?
  notes           String?
  
  // Relations
  user            User
  items           OrderItem[]
  commissions     Commission[]
}
```

#### Category Model
```prisma
model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  slug        String   @unique
  description String?
  imageUrl    String?
  parentId    Int?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  // Hierarchical relations
  parent      Category?
  children    Category[]
  products    Product[]
}
```

#### Commission Model
```prisma
model Commission {
  id                Int      @id @default(autoincrement())
  orderId           Int
  userId            String   // Who generated the sale
  recipientId       String   // Who receives the commission
  amount            Float
  commissionRate    Float
  relationshipLevel Int
  type              String   @default("DIRECT")
  status            String   @default("PENDING")
  
  // Relations
  order             Order
  user              User
  recipient         User
}
```

#### MembershipTier Model
```prisma
model MembershipTier {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  price       Float
  discount    Float    // Discount rate for this tier
  benefits    String?
  
  // Relations
  memberships UserMembership[]
}
```

#### Promotion Model
```prisma
model Promotion {
  id            Int      @id @default(autoincrement())
  title         String
  description   String?
  discountType  String   // PERCENTAGE or FIXED
  discountValue Float
  minPurchase   Float?
  startDate     DateTime
  endDate       DateTime?
  isActive      Boolean  @default(true)
}
```

### Enums (stored as strings)
- **UserRole**: SUPER_ADMIN, MANAGER, USER
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
- **OrderStatus**: PENDING, PROCESSING, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, PAID, FAILED, REFUNDED
- **ProductStatus**: ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED
- **CommissionStatus**: PENDING, APPROVED, PAID, REJECTED, CANCELLED
- **MembershipStatus**: ACTIVE, EXPIRED, CANCELLED
- **MembershipTier**: ESSENTIAL, PREMIUM

## Monitoring & Logging

### Structured Logging
- **Winston logger** with multiple transports
- **Log files**: `logs/error.log`, `logs/combined.log`
- **Log levels**: error, warn, info, http, debug
- **Request logging** with Morgan integration

### Health Check
```bash
curl http://localhost:4000/health
```

## E-Commerce Features

### Multi-Level Marketing (MLM) System

The MLM system supports up to 4 levels of commission distribution:

- **Level 1**: 30% commission (Sales)
- **Level 2**: 10% commission (Leader)
- **Level 3**: 5% commission (Manager)
- **Level 4**: 5% commission (Company)

Commissions are automatically calculated when orders are marked as completed or paid.

### Membership System

- **Free Membership**: All registered users automatically receive free membership
- **No Discount Tiers**: Product pricing is based on commission levels, not membership
- **Future Expansion**: System supports adding paid membership tiers with additional benefits

### Shopping Cart Features

- **Persistent Storage**: Cart data is cached for quick access
- **Guest Cart Support**: Anonymous shopping with cart sync on login
- **Real-time Updates**: Automatic total calculation with discounts
- **Stock Validation**: Prevents adding out-of-stock items

### Order Processing

- **Status Tracking**: PENDING → PROCESSING → COMPLETED
- **Payment Integration**: Support for multiple payment methods
- **Commission Generation**: Automatic MLM commission calculation
- **Order History**: Complete order tracking for users

### Product Management

- **Category Hierarchy**: Unlimited nested categories
- **Inventory Tracking**: Real-time stock management
- **Search & Filters**: Advanced product search with multiple filters
- **Featured Products**: Showcase top products

### Promotion System

- **Flexible Discounts**: Percentage or fixed amount discounts
- **Date-based Validity**: Automatic activation/expiration
- **Minimum Purchase**: Optional minimum order requirements
- **Code Validation**: Secure promotion code verification

## Extending the Template

### Adding New Features

1. **Create new models** in `prisma/schema.prisma`
2. **Run migrations**: `bun prisma migrate dev --name your_feature`
3. **Create services** in `src/services/`
4. **Create controllers** in `src/controllers/`
5. **Add routes** in `src/routes/api/v1/`
6. **Add validation schemas** in `src/middleware/validation/schemas/`
7. **Write tests** in `src/__tests__/`
8. **Update Swagger docs** in route files

### Switching Databases

To switch from SQLite to PostgreSQL:

1. Update `datasource` in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

3. Use the provided PostgreSQL Docker service:
```bash
bun run docker:start-all
```

4. Run migrations:
```bash
bun prisma migrate dev
```

## Performance Optimization

### Caching Strategy
- **User authentication**: Cached for 5 minutes
- **Database queries**: Consider implementing query result caching
- **Static data**: Cache configuration and lookup data

### Database Optimization
- **Indexes**: Added on frequently queried fields
- **Connection pooling**: Configured for production
- **Query optimization**: Use Prisma's query engine features

## Troubleshooting

### Common Issues

1. **Prisma Studio Error**: Make sure to run migrations first:
   ```bash
   bun prisma migrate dev
   ```

2. **TypeScript Errors**: Regenerate Prisma client:
   ```bash
   bun prisma generate
   ```

3. **Database Locked**: Stop all running processes and try again

4. **Email Not Sending**: 
   - Check Gmail app-specific password
   - Enable "Less secure app access" or use OAuth2

5. **Redis Connection Issues**:
   ```bash
   # Check if Redis is running
   bun run docker:status
   
   # Restart Redis
   bun run docker:stop
   bun run docker:start
   ```

6. **Rate Limiting Issues**: Clear rate limit data:
   ```bash
   # Connect to Redis and flush data
   docker exec -it app-be-redis redis-cli FLUSHALL
   ```

### Development Tips

1. **Environment Validation**: The app validates all environment variables at startup
2. **Logging**: Check `logs/` directory for detailed error information
3. **Testing**: Run tests before committing changes
4. **Debugging**: Use `bun run dev` for hot reloading during development

## Security Considerations

- ✅ **Rate limiting** implemented for all auth endpoints
- ✅ **Strong password policies** enforced
- ✅ **Refresh tokens hashed** before database storage
- ✅ **Environment validation** at startup
- ✅ **Structured logging** for audit trails
- ✅ **Input validation** on all endpoints
- ✅ **CORS configuration** for cross-origin requests
- ✅ **Security headers** with Helmet.js
- ⚠️ **HTTPS**: Use in production
- ⚠️ **API monitoring**: Consider implementing in production
- ⚠️ **Dependency updates**: Keep dependencies current

## License

This project is licensed under the MIT License.