import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing existing data...');

  // Clear existing data in correct order (respecting foreign key constraints)
  try {
    // First, clear tables that depend on others
    await prisma.emailVerification.deleteMany();
    await prisma.accountRequest.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.commission.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productCommissionTier.deleteMany();
    await prisma.giftItem.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userPoints.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.userRoleType.deleteMany();
    await prisma.userRelationship.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.membershipTier.deleteMany();
    await prisma.commissionTier.deleteMany();
    await prisma.volumeBonusTier.deleteMany();
    await prisma.auditLog.deleteMany();

    // Clear partner-related data
    await prisma.freeCheckupClaim.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.partnerDaysOff.deleteMany();
    await prisma.partnerAvailability.deleteMany();
    await prisma.service.deleteMany();
    await prisma.partner.deleteMany();

    // Finally, delete users
    await prisma.user.deleteMany();

    console.log('✅ Data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }

  // Create membership tier (free)
  const freeTier = await prisma.membershipTier.create({
    data: {
      name: 'FREE',
      description: 'Free membership with access to all products',
      price: 0,
      benefits: JSON.stringify({
        features: [
          'Access to all products',
          'MLM commission eligibility',
          'Referral program',
        ],
      }),
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Vitamins & Supplements',
        slug: 'vitamins-supplements',
        description: 'Essential vitamins and dietary supplements',
        imageUrl:
          'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=300&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Personal hygiene and care products',
        imageUrl:
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Fitness & Sports',
        slug: 'fitness-sports',
        description: 'Sports nutrition and fitness supplements',
        imageUrl:
          'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Herbal Products',
        slug: 'herbal-products',
        description: 'Natural and herbal health products',
        imageUrl:
          'https://images.unsplash.com/photo-1509130298739-651801c76e96?w=400&h=300&fit=crop',
      },
    }),
  ]);

  // Create users with MLM hierarchy
  const hashedPassword = await bcrypt.hash('TestPass@123', 10);

  // Super Admin
  const _superAdmin = await prisma.user.create({
    data: {
      email: 'super.admin@grabhealth.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'SUPERADMIN',
    },
  });

  // Company (Top level)
  const company = await prisma.user.create({
    data: {
      email: 'company@grabhealth.com',
      password: hashedPassword,
      firstName: 'GrabHealth',
      lastName: 'Company',
      role: 'COMPANY',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'COMPANY001',
    },
  });

  // Managers
  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@grabhealth.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Manager',
      role: 'MANAGER',
      uplineId: company.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'MANAGER001',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@grabhealth.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Manager',
      role: 'MANAGER',
      uplineId: company.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'MANAGER002',
    },
  });

  // Leaders
  const leader1 = await prisma.user.create({
    data: {
      email: 'leader1@grabhealth.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Leader',
      role: 'LEADER',
      uplineId: manager1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'LEADER001',
    },
  });

  const leader2 = await prisma.user.create({
    data: {
      email: 'leader2@grabhealth.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Leader',
      role: 'LEADER',
      uplineId: manager1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'LEADER002',
    },
  });

  const leader3 = await prisma.user.create({
    data: {
      email: 'leader3@grabhealth.com',
      password: hashedPassword,
      firstName: 'Tom',
      lastName: 'Leader',
      role: 'LEADER',
      uplineId: manager2.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'LEADER003',
    },
  });

  // Sales
  const sales1 = await prisma.user.create({
    data: {
      email: 'sales1@grabhealth.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Sales',
      role: 'SALES',
      uplineId: leader1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'SALES001',
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: 'sales2@grabhealth.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Sales',
      role: 'SALES',
      uplineId: leader1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'SALES002',
    },
  });

  const sales3 = await prisma.user.create({
    data: {
      email: 'sales3@grabhealth.com',
      password: hashedPassword,
      firstName: 'Charlie',
      lastName: 'Sales',
      role: 'SALES',
      uplineId: leader2.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'SALES003',
    },
  });

  // Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'User',
      role: 'USER',
      uplineId: sales1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'USER001',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'User',
      role: 'USER',
      uplineId: sales1.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'USER002',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      password: hashedPassword,
      firstName: 'Frank',
      lastName: 'User',
      role: 'USER',
      uplineId: sales2.id,
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      referralCode: 'USER003',
    },
  });

  // Create user memberships for all users
  const allUsers = [
    company,
    manager1,
    manager2,
    leader1,
    leader2,
    leader3,
    sales1,
    sales2,
    sales3,
    user1,
    user2,
    user3,
  ];
  for (const user of allUsers) {
    await prisma.userMembership.create({
      data: {
        userId: user.id,
        tierId: freeTier.id,
        status: 'ACTIVE',
      },
    });
  }

  // Create user relationships
  const relationships = [
    { userId: manager1.id, uplineId: company.id, relationshipLevel: 1 },
    { userId: manager2.id, uplineId: company.id, relationshipLevel: 1 },
    { userId: leader1.id, uplineId: manager1.id, relationshipLevel: 1 },
    { userId: leader1.id, uplineId: company.id, relationshipLevel: 2 },
    { userId: leader2.id, uplineId: manager1.id, relationshipLevel: 1 },
    { userId: leader2.id, uplineId: company.id, relationshipLevel: 2 },
    { userId: leader3.id, uplineId: manager2.id, relationshipLevel: 1 },
    { userId: leader3.id, uplineId: company.id, relationshipLevel: 2 },
    { userId: sales1.id, uplineId: leader1.id, relationshipLevel: 1 },
    { userId: sales1.id, uplineId: manager1.id, relationshipLevel: 2 },
    { userId: sales1.id, uplineId: company.id, relationshipLevel: 3 },
    { userId: sales2.id, uplineId: leader1.id, relationshipLevel: 1 },
    { userId: sales2.id, uplineId: manager1.id, relationshipLevel: 2 },
    { userId: sales2.id, uplineId: company.id, relationshipLevel: 3 },
    { userId: sales3.id, uplineId: leader2.id, relationshipLevel: 1 },
    { userId: sales3.id, uplineId: manager1.id, relationshipLevel: 2 },
    { userId: sales3.id, uplineId: company.id, relationshipLevel: 3 },
    { userId: user1.id, uplineId: sales1.id, relationshipLevel: 1 },
    { userId: user1.id, uplineId: leader1.id, relationshipLevel: 2 },
    { userId: user1.id, uplineId: manager1.id, relationshipLevel: 3 },
    { userId: user1.id, uplineId: company.id, relationshipLevel: 4 },
    { userId: user2.id, uplineId: sales1.id, relationshipLevel: 1 },
    { userId: user2.id, uplineId: leader1.id, relationshipLevel: 2 },
    { userId: user2.id, uplineId: manager1.id, relationshipLevel: 3 },
    { userId: user2.id, uplineId: company.id, relationshipLevel: 4 },
    { userId: user3.id, uplineId: sales2.id, relationshipLevel: 1 },
    { userId: user3.id, uplineId: leader1.id, relationshipLevel: 2 },
    { userId: user3.id, uplineId: manager1.id, relationshipLevel: 3 },
    { userId: user3.id, uplineId: company.id, relationshipLevel: 4 },
  ];

  for (const rel of relationships) {
    await prisma.userRelationship.create({ data: rel });
  }

  // Create the 4 GrabHealth commission products
  console.log('🛍️ Creating GrabHealth 4-Product Commission System...');

  const products = [
    {
      name: 'Real Man',
      description: 'Premium health supplement for men',
      sku: 'REAL_MAN_001',
      categoryId: categories[0].id, // Vitamins & Supplements
      imageUrl:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
      status: 'ACTIVE',
      pricing: {
        pvValue: 600,
        customerPrice: 3600.0,
        travelPackagePrice: 799.0,
        costPrice: 1800.0, // Hidden from customers
      },
      commissions: {
        salesCommissionAmount: 1080.0, // 30% of $3,600
        leaderCommissionAmount: 360.0, // 10% of $3,600
        managerCommissionAmount: 180.0, // 5% of $3,600
      },
    },
    {
      name: 'Wild Ginseng Honey',
      description: 'Premium wild ginseng honey blend',
      sku: 'GINSENG_HONEY_001',
      categoryId: categories[3].id, // Herbal Products
      imageUrl:
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop',
      status: 'ACTIVE',
      pricing: {
        pvValue: 700,
        customerPrice: 1000.0,
        travelPackagePrice: null,
        costPrice: 500.0, // Hidden from customers
      },
      commissions: {
        salesCommissionAmount: 300.0, // 30% of $1,000
        leaderCommissionAmount: 100.0, // 10% of $1,000
        managerCommissionAmount: 50.0, // 5% of $1,000
      },
    },
    {
      name: 'Golden Ginseng Water',
      description: 'Premium golden ginseng infused water',
      sku: 'GOLDEN_WATER_001',
      categoryId: categories[3].id, // Herbal Products
      imageUrl:
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop',
      status: 'ACTIVE',
      pricing: {
        pvValue: 2000,
        customerPrice: 18.9,
        travelPackagePrice: null,
        costPrice: 9.45, // Hidden from customers
      },
      commissions: {
        salesCommissionAmount: 5.67, // 30% of $18.90
        leaderCommissionAmount: 1.89, // 10% of $18.90
        managerCommissionAmount: 0.95, // 5% of $18.90
      },
    },
    {
      name: 'Travel Package',
      description: 'Complete health and wellness travel package',
      sku: 'TRAVEL_PKG_001',
      categoryId: categories[2].id, // Fitness & Sports
      imageUrl:
        'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop',
      status: 'ACTIVE',
      pricing: {
        pvValue: 500,
        customerPrice: 799.0,
        travelPackagePrice: null,
        costPrice: 400.0, // Hidden from customers
      },
      commissions: {
        salesCommissionAmount: 239.7, // 30% of $799
        leaderCommissionAmount: 79.9, // 10% of $799
        managerCommissionAmount: 39.95, // 5% of $799
      },
    },
  ];

  const createdProducts: any[] = [];
  for (const productData of products) {
    console.log(`Creating product: ${productData.name}`);

    // Create product
    const product = await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        status: productData.status,
        category: {
          connect: { id: productData.categoryId },
        },
      },
    });

    // Create product pricing
    await prisma.productPricing.create({
      data: {
        productId: product.id,
        pvValue: productData.pricing.pvValue,
        customerPrice: productData.pricing.customerPrice,
        travelPackagePrice: productData.pricing.travelPackagePrice,
        costPrice: productData.pricing.costPrice,
      },
    });

    // Create product commission tier
    await prisma.productCommissionTier.create({
      data: {
        productId: product.id,
        productName: productData.name,
        salesCommissionAmount: productData.commissions.salesCommissionAmount,
        leaderCommissionAmount: productData.commissions.leaderCommissionAmount,
        managerCommissionAmount:
          productData.commissions.managerCommissionAmount,
        salesCommissionRate: 0.3,
        leaderCommissionRate: 0.1,
        managerCommissionRate: 0.05,
      },
    });

    createdProducts.push(product);
    console.log(
      `✅ Created ${productData.name} with pricing and commission structure`
    );
  }

  console.log(
    '\n📊 Commission Calculation Summary (for Sales role selling 1 unit each):'
  );
  console.log('Real Man: $1,080.00 commission (30% of $3,600) + 600 PV');
  console.log(
    'Wild Ginseng Honey: $300.00 commission (30% of $1,000) + 700 PV'
  );
  console.log(
    'Golden Ginseng Water: $5.67 commission (30% of $18.90) + 2,000 PV'
  );
  console.log('Travel Package: $239.70 commission (30% of $799) + 500 PV');
  console.log('Total: $1,625.37 commission + 3,800 PV');

  // Create sample orders with different statuses using the 4 products
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'COMPLETED',
      shippingAddress: '123 Main St, City, State 12345',
      billingAddress: '123 Main St, City, State 12345',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PAID',
      subtotal: 4600.0, // Real Man + Wild Ginseng Honey
      discount: 0,
      tax: 368.0,
      total: 4968.0,
      items: {
        create: [
          {
            productId: createdProducts[0].id, // Real Man
            quantity: 1,
            price: 3600.0,
            pvPoints: 600,
          },
          {
            productId: createdProducts[1].id, // Wild Ginseng Honey
            quantity: 1,
            price: 1000.0,
            pvPoints: 700,
          },
        ],
      },
    },
  });

  const _order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'PROCESSING',
      shippingAddress: '456 Oak Ave, City, State 12346',
      billingAddress: '456 Oak Ave, City, State 12346',
      paymentMethod: 'PAYPAL',
      paymentStatus: 'PAID',
      subtotal: 817.9, // Travel Package + Golden Ginseng Water
      discount: 0,
      tax: 65.43,
      total: 883.33,
      items: {
        create: [
          {
            productId: createdProducts[3].id, // Travel Package
            quantity: 1,
            price: 799.0,
            pvPoints: 500,
          },
          {
            productId: createdProducts[2].id, // Golden Ginseng Water
            quantity: 1,
            price: 18.9,
            pvPoints: 2000,
          },
        ],
      },
    },
  });

  const _order3 = await prisma.order.create({
    data: {
      userId: sales1.id,
      status: 'PENDING',
      shippingAddress: '789 Pine Rd, City, State 12347',
      billingAddress: '789 Pine Rd, City, State 12347',
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PENDING',
      subtotal: 37.8, // Golden Ginseng Water x2
      discount: 0,
      tax: 3.02,
      total: 40.82,
      items: {
        create: [
          {
            productId: createdProducts[2].id, // Golden Ginseng Water
            quantity: 2,
            price: 18.9,
            pvPoints: 2000,
          },
        ],
      },
    },
  });

  // Create sample commissions from order1 using the new commission structure
  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: sales1.id,
      orderId: order1.id,
      amount: 1380.0, // Sales commission: Real Man (1080) + Wild Ginseng Honey (300)
      commissionRate: 0.3,
      relationshipLevel: 1,
      recipientRole: 'SALES',
      type: 'DIRECT',
      status: 'PAID',
      pvPoints: 1300, // 600 + 700 PV
    },
  });

  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: leader1.id,
      orderId: order1.id,
      amount: 460.0, // Leader commission: Real Man (360) + Wild Ginseng Honey (100)
      commissionRate: 0.1,
      relationshipLevel: 2,
      recipientRole: 'LEADER',
      type: 'INDIRECT',
      status: 'PAID',
      pvPoints: 1300, // 600 + 700 PV
    },
  });

  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: manager1.id,
      orderId: order1.id,
      amount: 230.0, // Manager commission: Real Man (180) + Wild Ginseng Honey (50)
      commissionRate: 0.05,
      relationshipLevel: 3,
      recipientRole: 'MANAGER',
      type: 'INDIRECT',
      status: 'PAID',
      pvPoints: 1300, // 600 + 700 PV
    },
  });

  // Create commission tiers
  const commissionTiers = [
    {
      tierLevel: 1,
      tierName: 'Direct Sales',
      directCommissionRate: 0.1,
      indirectCommissionRate: 0,
      pointsRate: 100,
    },
    {
      tierLevel: 2,
      tierName: 'Level 2',
      directCommissionRate: 0,
      indirectCommissionRate: 0.05,
      pointsRate: 50,
    },
    {
      tierLevel: 3,
      tierName: 'Level 3',
      directCommissionRate: 0,
      indirectCommissionRate: 0.03,
      pointsRate: 30,
    },
    {
      tierLevel: 4,
      tierName: 'Level 4',
      directCommissionRate: 0,
      indirectCommissionRate: 0.02,
      pointsRate: 20,
    },
  ];

  for (const tier of commissionTiers) {
    await prisma.commissionTier.create({ data: tier });
  }

  // Create partners and services
  console.log('🏥 Creating partners and services...');

  const partner1 = await prisma.partner.create({
    data: {
      id: 'cltest001',
      name: 'GrabHealth Pharmacy - Downtown',
      description: 'Your trusted health partner in downtown district',
      address: '123 Main Street, Downtown District',
      city: 'Singapore',
      state: 'Singapore',
      country: 'Singapore',
      postalCode: '123456',
      phone: '+65 1234 5678',
      email: 'downtown@grabhealth.sg',
      website: 'https://grabhealth.sg',
      rating: 4.5,
      totalReviews: 156,
      operatingHours: JSON.stringify({
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '10:00', close: '18:00' },
      }),
      specializations: ['Pharmacy', 'Health Screening', 'Vaccination'],
      services: {
        create: [
          {
            name: 'Basic Health Screening',
            description:
              'Comprehensive health check including blood pressure, BMI, and basic blood tests',
            duration: 60,
            price: 80.0,
            category: 'Body Check',
          },
          {
            name: 'Premium Health Screening',
            description:
              'Advanced health screening with full blood panel and ECG',
            duration: 90,
            price: 150.0,
            category: 'Body Check',
          },
          {
            name: 'Vaccination Consultation',
            description: 'Consultation and administration of vaccines',
            duration: 30,
            price: 50.0,
            category: 'Consultation',
          },
        ],
      },
      availability: {
        create: [
          {
            dayOfWeek: 0,
            startTime: '10:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 3,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 4,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 5,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 6,
            startTime: '09:00',
            endTime: '20:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
        ],
      },
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      id: 'cltest002',
      name: 'Wellness Clinic - Midtown',
      description: 'Comprehensive healthcare services',
      address: '456 Health Avenue, Midtown',
      city: 'Singapore',
      state: 'Singapore',
      country: 'Singapore',
      postalCode: '234567',
      phone: '+65 2345 6789',
      email: 'midtown@wellnessclinic.sg',
      rating: 4.2,
      totalReviews: 89,
      operatingHours: JSON.stringify({
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '15:00' },
        sunday: { open: 'closed', close: 'closed' },
      }),
      specializations: [
        'General Practice',
        'Health Screening',
        'Specialist Consultation',
      ],
      services: {
        create: [
          {
            name: 'General Consultation',
            description: 'Consultation with general practitioner',
            duration: 30,
            price: 60.0,
            category: 'Consultation',
          },
          {
            name: 'Executive Health Screening',
            description: 'Comprehensive executive health package',
            duration: 120,
            price: 280.0,
            category: 'Body Check',
            requiresApproval: true,
            maxBookingsPerDay: 5,
          },
        ],
      },
      availability: {
        create: [
          {
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
          {
            dayOfWeek: 2,
            startTime: '08:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
          {
            dayOfWeek: 3,
            startTime: '08:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
          {
            dayOfWeek: 4,
            startTime: '08:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
          {
            dayOfWeek: 5,
            startTime: '08:00',
            endTime: '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
          {
            dayOfWeek: 6,
            startTime: '09:00',
            endTime: '15:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
        ],
      },
    },
  });

  const partner3 = await prisma.partner.create({
    data: {
      id: 'cltest003',
      name: 'GrabHealth Center - Eastside',
      description: 'Premium health services and products',
      address: '789 Wellness Road, East District',
      city: 'Singapore',
      state: 'Singapore',
      country: 'Singapore',
      postalCode: '345678',
      phone: '+65 3456 7890',
      email: 'eastside@grabhealth.sg',
      rating: 4.7,
      totalReviews: 234,
      operatingHours: JSON.stringify({
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '19:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: 'closed', close: 'closed' },
      }),
      specializations: [
        'Health Screening',
        'Physiotherapy',
        'Nutrition Counseling',
      ],
      services: {
        create: [
          {
            name: 'Physiotherapy Session',
            description: 'One-on-one physiotherapy treatment',
            duration: 60,
            price: 100.0,
            category: 'Therapy',
          },
          {
            name: 'Nutrition Counseling',
            description: 'Personalized nutrition and diet consultation',
            duration: 45,
            price: 80.0,
            category: 'Consultation',
          },
          {
            name: 'Full Body Check',
            description: 'Comprehensive full body health screening',
            duration: 90,
            price: 200.0,
            category: 'Body Check',
          },
        ],
      },
      availability: {
        create: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 2,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 3,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 4,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 5,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
          {
            dayOfWeek: 6,
            startTime: '09:00',
            endTime: '19:00',
            slotDuration: 30,
            maxBookingsPerSlot: 2,
          },
        ],
      },
    },
  });

  console.log('🎉 GrabHealth seed data created successfully!');
  console.log('\n🔐 Test Credentials:');
  console.log('================');
  console.log('All passwords: TestPass@123');
  console.log('\nSuper Admin: super.admin@grabhealth.com');
  console.log('Company: company@grabhealth.com');
  console.log('Managers: manager1@grabhealth.com, manager2@grabhealth.com');
  console.log(
    'Leaders: leader1@grabhealth.com, leader2@grabhealth.com, leader3@grabhealth.com'
  );
  console.log(
    'Sales: sales1@grabhealth.com, sales2@grabhealth.com, sales3@grabhealth.com'
  );
  console.log('Users: user1@example.com, user2@example.com, user3@example.com');
  console.log('\n🏢 MLM Structure:');
  console.log('Company -> Managers -> Leaders -> Sales -> Users');
  console.log('\n🛍️ Products: 4 GrabHealth commission products created');
  console.log('📦 Orders: 3 sample orders with different statuses');
  console.log(
    '💰 Commissions: Sample commission structure for order1 with new rates'
  );
  console.log(
    '🏥 Partners: 3 healthcare partners with services and availability'
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
