# GrabHealth AI Features (Simplified Architecture)

## Core Features

### 1. E-commerce System
- **Product Management**
  - [x] Product catalog with categories
  - [x] Product images and descriptions
  - [x] Pricing management
  - [x] Stock tracking
  - [x] Product search and filtering

- **Order Management**
  - [x] Shopping cart functionality
  - [x] Order creation and checkout
  - [x] Order status tracking
  - [x] Order history
  - [ ] Payment integration
  - [ ] Refund handling

### 2. Referral System
- **User Registration**
  - [x] Register with email/password
  - [x] Register under referral code
  - [x] Automatic upline/downline tracking
  - [x] Unique referral code generation
  
- **Network Management**
  - [x] View downline network
  - [x] Track referral relationships
  - [ ] Commission calculation (planned)
  - [ ] Network visualization (planned)

### 3. Partner Services
- **Partner Management**
  - [x] Partner profiles
  - [x] Service listings
  - [x] Availability schedules
  - [x] Days off management
  
- **Booking System**
  - [x] Service booking
  - [x] Appointment scheduling
  - [x] Booking status tracking
  - [x] Partner dashboard

## Technical Architecture

### Backend (Strapi)
- **Content Types**
  - User (with upline/downline relations)
  - Product & Category
  - Order & Order Items
  - Partner & Services
  - Booking & Availability

- **Authentication**
  - JWT-based authentication
  - Role-based access (using Strapi's built-in roles)
  - Bearer token in headers

### Frontend (Next.js)
- **Pages**
  - Products catalog
  - Shopping cart
  - User profile
  - Partner services
  - Booking system
  
- **State Management**
  - Auth context
  - Cart management
  - User session

## Removed Features (Simplification)
- ❌ Complex commission tiers
- ❌ Multiple membership levels
- ❌ User role types
- ❌ Audit logging
- ❌ Promotions system
- ❌ Points/rewards system
- ❌ Email verification flow
- ❌ Gift items

## Future Roadmap
1. **Phase 1**: Stabilize core e-commerce and referral
2. **Phase 2**: Add commission calculation
3. **Phase 3**: Network visualization
4. **Phase 4**: Payment integration
5. **Phase 5**: Mobile app support