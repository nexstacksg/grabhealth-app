import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create membership tiers
  const essentialTier = await prisma.membershipTier.upsert({
    where: { name: 'Essential' },
    update: {},
    create: {
      name: 'Essential',
      description: 'Basic membership with 10% discount on all products',
      price: 29.99,
      discount: 0.10,
      benefits: 'Access to exclusive products, Monthly health tips newsletter'
    }
  })

  const premiumTier = await prisma.membershipTier.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      description: 'Premium membership with 25% discount on all products',
      price: 99.99,
      discount: 0.25,
      benefits: 'All Essential benefits, Priority customer support, Free shipping on orders over $50, Quarterly gift items'
    }
  })

  console.log('Created membership tiers:', { essentialTier, premiumTier })

  // Create commission tiers
  const commissionTiers = [
    { tierLevel: 1, tierName: 'Tier 1 (Direct Sales)', directCommissionRate: 0.30, indirectCommissionRate: 0.00, pointsRate: 0 },
    { tierLevel: 2, tierName: 'Tier 2 (Indirect Sales)', directCommissionRate: 0.30, indirectCommissionRate: 0.10, pointsRate: 0 },
    { tierLevel: 3, tierName: 'Tier 3 (Points)', directCommissionRate: 0.30, indirectCommissionRate: 0.00, pointsRate: 10 },
    { tierLevel: 4, tierName: 'Tier 4+ (Legacy)', directCommissionRate: 0.30, indirectCommissionRate: 0.00, pointsRate: 5 }
  ]

  for (const tier of commissionTiers) {
    await prisma.commissionTier.upsert({
      where: { tierLevel: tier.tierLevel },
      update: {},
      create: tier
    })
  }

  console.log('Created commission tiers')

  // Create user role types
  const distributorRole = await prisma.userRoleType.upsert({
    where: { roleName: 'Distributor' },
    update: {},
    create: {
      roleName: 'Distributor',
      description: 'Base level distributor role',
      commissionMultiplier: 1.0
    }
  })

  const traderRole = await prisma.userRoleType.upsert({
    where: { roleName: 'Trader' },
    update: {},
    create: {
      roleName: 'Trader',
      description: 'Mid-level trader role with higher commission rates',
      commissionMultiplier: 1.2
    }
  })

  console.log('Created user role types:', { distributorRole, traderRole })

  // Create volume bonus tiers
  const volumeBonusTiers = [
    { minVolume: 0, maxVolume: 1000, bonusPercentage: 0.0 },
    { minVolume: 1000, maxVolume: 5000, bonusPercentage: 2.0 },
    { minVolume: 5000, maxVolume: 10000, bonusPercentage: 3.5 },
    { minVolume: 10000, maxVolume: null, bonusPercentage: 5.0 }
  ]

  for (const tier of volumeBonusTiers) {
    await prisma.volumeBonusTier.create({
      data: tier
    })
  }

  console.log('Created volume bonus tiers')

  // Create sample products
  const products = [
    {
      name: 'Multivitamin Daily',
      description: 'Complete daily multivitamin with essential nutrients for overall health and wellbeing.',
      price: 19.99,
      category: 'Vitamins',
      imageUrl: 'https://placehold.co/300x300/e6f7ff/0a85ff?text=Multivitamin',
      inStock: true
    },
    {
      name: 'Omega-3 Fish Oil',
      description: 'High-quality fish oil supplement rich in EPA and DHA for heart and brain health.',
      price: 24.99,
      category: 'Supplements',
      imageUrl: 'https://placehold.co/300x300/fff5e6/ff8c00?text=Omega-3',
      inStock: true
    },
    {
      name: 'Vitamin C 1000mg',
      description: 'High-potency vitamin C with rose hips for immune support and antioxidant protection.',
      price: 15.99,
      category: 'Vitamins',
      imageUrl: 'https://placehold.co/300x300/f9f9f9/ff6b6b?text=Vitamin+C',
      inStock: true
    },
    {
      name: 'Digital Blood Pressure Monitor',
      description: 'Accurate and easy-to-use digital blood pressure monitor for home use.',
      price: 59.99,
      category: 'Personal Care',
      imageUrl: 'https://placehold.co/300x300/f0f0f0/4a90e2?text=BP+Monitor',
      inStock: true
    },
    {
      name: 'First Aid Kit',
      description: 'Comprehensive first aid kit with essential supplies for emergency situations.',
      price: 29.99,
      category: 'First Aid',
      imageUrl: 'https://placehold.co/300x300/ffebeb/ff4d4d?text=First+Aid',
      inStock: true
    },
    {
      name: 'Probiotic Complex',
      description: 'Advanced probiotic formula with multiple strains for digestive health and immune support.',
      price: 34.99,
      category: 'Supplements',
      imageUrl: 'https://placehold.co/300x300/e8f5e9/43a047?text=Probiotic',
      inStock: true
    },
    {
      name: 'Magnesium Glycinate',
      description: 'Highly absorbable form of magnesium for muscle relaxation and nervous system support.',
      price: 22.99,
      category: 'Supplements',
      imageUrl: 'https://placehold.co/300x300/e3f2fd/2196f3?text=Magnesium',
      inStock: true
    },
    {
      name: 'Vitamin D3 5000 IU',
      description: 'High-potency vitamin D3 for bone health, immune function, and mood support.',
      price: 18.99,
      category: 'Vitamins',
      imageUrl: 'https://placehold.co/300x300/fffde7/fbc02d?text=Vitamin+D3',
      inStock: true
    },
    {
      name: 'Digital Thermometer',
      description: 'Fast and accurate digital thermometer for oral, rectal, or underarm temperature readings.',
      price: 12.99,
      category: 'Personal Care',
      imageUrl: 'https://placehold.co/300x300/e0f7fa/00bcd4?text=Thermometer',
      inStock: true
    },
    {
      name: 'Zinc Lozenges',
      description: 'Soothing zinc lozenges with vitamin C for immune support during cold season.',
      price: 9.99,
      category: 'Supplements',
      imageUrl: 'https://placehold.co/300x300/f3e5f5/9c27b0?text=Zinc',
      inStock: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log('Created sample products')

  // Create sample users (for testing)
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@grabhealth.ai',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin'
    }
  })

  // Regular users with upline relationships
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'customer'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'customer'
    }
  })

  // Set up MLM relationships (John is Jane's upline)
  await prisma.userRelationship.create({
    data: {
      userId: user2.id,
      uplineId: user1.id,
      relationshipLevel: 1
    }
  })

  // Give John the Trader role
  await prisma.userRole.create({
    data: {
      userId: user1.id,
      roleId: traderRole.id
    }
  })

  // Initialize points for users
  await prisma.userPoints.create({
    data: {
      userId: user1.id,
      points: 100
    }
  })

  console.log('Created sample users with relationships')

  // Create a sample promotion
  await prisma.promotion.create({
    data: {
      title: 'New Year Special',
      description: 'Get 20% off on all supplements',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true
    }
  })

  console.log('Created sample promotion')

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })