# GrabHealth AI

A comprehensive e-commerce platform for health and wellness products with integrated multi-level marketing (MLM) capabilities and AI-powered features.

## Project Story

GrabHealth AI was born from the vision to revolutionize how people access and purchase health products while creating sustainable income opportunities through a modern MLM structure. The platform combines the convenience of online shopping with the power of network marketing, enhanced by AI technology to provide personalized product recommendations and customer support.

### The Challenge

Traditional health product distribution often involves multiple middlemen, leading to higher prices for consumers and limited earning opportunities for distributors. Additionally, customers struggle to find the right products for their specific health needs without personalized guidance.

### Our Solution

GrabHealth AI addresses these challenges by:

- **Direct-to-Consumer Model**: Eliminating unnecessary intermediaries to offer competitive prices
- **MLM Integration**: Empowering users to build their own distribution networks and earn commissions
- **AI-Powered Assistance**: Providing personalized product recommendations and 24/7 customer support
- **Membership Benefits**: Offering tiered discounts to reward customer loyalty

## Key Features

### 🛍️ E-Commerce Platform

- Comprehensive product catalog with health supplements, vitamins, and personal care items
- User-friendly shopping cart and checkout process
- Order tracking and history
- Product search and filtering capabilities

### 👥 Multi-Level Marketing System

- 4-level deep commission structure
- Real-time commission tracking and calculations
- Network visualization showing upline/downline relationships
- Referral link generation for easy recruitment
- Commission dashboard with detailed earnings breakdown

### 🎯 Membership Tiers

- **Essential Membership**: 10% discount on all products
- **Premium Membership**: 25% discount on all products
- Membership-specific benefits and exclusive offers

### 🤖 AI Integration

- **Product Recommendation Engine**: Personalized suggestions based on user preferences and health goals
- **AI Chatbot**: 24/7 customer support for product inquiries and health guidance
- Powered by OpenAI's latest models for accurate and helpful responses

### 👨‍💼 Admin Panel

- User management and role-based access control
- Network visualization and monitoring
- Product inventory management
- Commission structure configuration
- System settings and analytics

### 📱 Mobile-First Design

- Fully responsive interface optimized for all devices
- Touch-friendly navigation and interactions
- Progressive web app capabilities

## Technical Requirements

### Prerequisites

- Node.js 20+
- npm or yarn package manager
- PostgreSQL database (Neon recommended)
- Cloudinary account for image storage
- OpenAI API key for AI features

### Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL=your_neon_postgresql_url
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OPENAI_API_KEY=your_openai_api_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/grabHealth-AI.git
cd grabHealth-AI

# Install dependencies
npm install

# Set up the database
npm run setup-db

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## Project Structure

```
grabHealth-AI/
├── app/              # Next.js app directory with pages and API routes
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and helpers
├── db/              # Database schemas and migrations
├── public/          # Static assets
└── styles/          # Global styles and CSS modules
```

## User Roles

### Customer

- Browse and purchase products
- Join membership programs
- Participate in MLM network
- Track orders and commissions
- Access AI-powered recommendations

### Admin

- Manage users and permissions
- Configure commission structures
- Monitor network growth
- Access analytics and reports
- Manage product inventory

## Commission Structure

### Multi-Level Commission System

The MLM system uses a sophisticated 4-tier hierarchical structure with both monetary commissions and point rewards:

| Level | Tier Name | Direct Commission | Indirect Commission | Points Rate | Description |
|-------|-----------|-------------------|---------------------|-------------|-------------|
| 1 | Direct Sales | 30% | 0% | 0 | Direct upline receives 30% of order value |
| 2 | Indirect Sales | 30% | 10% | 0 | Seller gets 30%, their upline gets 10% |
| 3 | Points Tier | 30% | 0% | 10 pts/$100 | Seller gets 30%, upline earns points |
| 4+ | Legacy Tier | 30% | 0% | 5 pts/$100 | Seller gets 30%, higher uplines earn points |

### Product-Based Commission Rates

Different products have specific commission structures based on user roles:

#### User Roles
- **Distributor**: Base level with standard commission rates (1.0x multiplier)
- **Trader**: Mid-level with enhanced commission rates (1.2x multiplier)

#### Sample Product Pricing & Commission Tiers

| Product | Retail Price | Trader Price | Distributor Price | Trader Commission | Distributor Commission |
|---------|--------------|--------------|-------------------|-------------------|------------------------|
| Golden GinSeng Water (480ml) | $18.70 | $14.00 | $11.00 | 10-15% | 8-12% |
| Honey Wild GinSeng | $997.00 | $747.00 | $587.00 | 12-18% | 10-15% |
| RealMan (Men's Health) | $3,697.00 | $2,678.00 | $2,097.00 | 15-20% | 12-17% |

### Volume-Based Bonus System

Sales volume achievements unlock additional commission bonuses:

| Sales Volume Range | Bonus Percentage | Effective Commission Increase |
|-------------------|------------------|-------------------------------|
| $0 - $1,000 | 0% | Base commission rate |
| $1,000 - $5,000 | 2% | +2% on base rate |
| $5,000 - $10,000 | 3.5% | +3.5% on base rate |
| $10,000+ | 5% | +5% on base rate |

### Commission Calculation Process

1. **Upline Chain Identification**: System traces up to 4 levels of uplines
2. **Commission Distribution**:
   - Level 1 (Direct upline): Receives monetary commission
   - Level 2: Receives reduced monetary commission
   - Levels 3-4: Earn points instead of direct commission
3. **Volume Bonus Application**: Commission rates increase based on seller's total sales volume
4. **Role Multiplier**: Traders receive 1.2x commission compared to Distributors

### Referral System

- **Referral Links**: `/auth/register?referrer={userId}`
- **Automatic Network Building**: New registrations via referral link automatically join the referrer's downline
- **Commission Tracking**: Real-time commission calculations and dashboard visibility
- **QR Code Generation**: Easy sharing of referral links via QR codes

## Security Features

- Secure password hashing with bcrypt
- Session-based authentication
- Protected API routes with middleware
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention

## Future Enhancements

- [ ] Mobile app development (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Automated email marketing
- [ ] Cryptocurrency payment integration
- [ ] International shipping support
- [ ] Multi-language support
- [ ] Advanced AI health assessments
- [ ] Virtual health consultations

## Contributing

We welcome contributions to GrabHealth AI! Please read our contributing guidelines before submitting pull requests.

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries:

- Email: support@grabhealth.ai
- Documentation: [docs.grabhealth.ai](https://docs.grabhealth.ai)
- Community Forum: [community.grabhealth.ai](https://community.grabhealth.ai)

---

Built with ❤️ by the GrabHealth AI Team
