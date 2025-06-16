import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Clearing existing data...");
  
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
    
    // Finally, delete users
    await prisma.user.deleteMany();
    
    console.log("✅ Data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }

  // Create membership tier (free)
  const freeTier = await prisma.membershipTier.create({
    data: {
      name: "FREE",
      description: "Free membership with access to all products",
      price: 0,
      benefits: JSON.stringify({
        features: ["Access to all products", "MLM commission eligibility", "Referral program"],
      }),
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Vitamins & Supplements",
        slug: "vitamins-supplements",
        description: "Essential vitamins and dietary supplements",
        imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=300&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Personal Care",
        slug: "personal-care",
        description: "Personal hygiene and care products",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fitness & Sports",
        slug: "fitness-sports",
        description: "Sports nutrition and fitness supplements",
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop",
      },
    }),
    prisma.category.create({
      data: {
        name: "Herbal Products",
        slug: "herbal-products",
        description: "Natural and herbal health products",
        imageUrl: "https://images.unsplash.com/photo-1509130298739-651801c76e96?w=400&h=300&fit=crop",
      },
    }),
  ]);

  // Create users with MLM hierarchy
  const hashedPassword = await bcrypt.hash("TestPass@123", 10);

  // Super Admin
  const _superAdmin = await prisma.user.create({
    data: {
      email: "super.admin@grabhealth.com",
      password: hashedPassword,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "SUPERADMIN",
    },
  });

  // Company (Top level)
  const company = await prisma.user.create({
    data: {
      email: "company@grabhealth.com",
      password: hashedPassword,
      firstName: "GrabHealth",
      lastName: "Company",
      role: "COMPANY",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "COMPANY001",
    },
  });

  // Managers
  const manager1 = await prisma.user.create({
    data: {
      email: "manager1@grabhealth.com",
      password: hashedPassword,
      firstName: "John",
      lastName: "Manager",
      role: "MANAGER",
      uplineId: company.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "MANAGER001",
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: "manager2@grabhealth.com",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Manager",
      role: "MANAGER",
      uplineId: company.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "MANAGER002",
    },
  });

  // Leaders
  const leader1 = await prisma.user.create({
    data: {
      email: "leader1@grabhealth.com",
      password: hashedPassword,
      firstName: "Mike",
      lastName: "Leader",
      role: "LEADER",
      uplineId: manager1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "LEADER001",
    },
  });

  const leader2 = await prisma.user.create({
    data: {
      email: "leader2@grabhealth.com",
      password: hashedPassword,
      firstName: "Sarah",
      lastName: "Leader",
      role: "LEADER",
      uplineId: manager1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "LEADER002",
    },
  });

  const leader3 = await prisma.user.create({
    data: {
      email: "leader3@grabhealth.com",
      password: hashedPassword,
      firstName: "Tom",
      lastName: "Leader",
      role: "LEADER",
      uplineId: manager2.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "LEADER003",
    },
  });

  // Sales
  const sales1 = await prisma.user.create({
    data: {
      email: "sales1@grabhealth.com",
      password: hashedPassword,
      firstName: "Alice",
      lastName: "Sales",
      role: "SALES",
      uplineId: leader1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "SALES001",
    },
  });

  const sales2 = await prisma.user.create({
    data: {
      email: "sales2@grabhealth.com",
      password: hashedPassword,
      firstName: "Bob",
      lastName: "Sales",
      role: "SALES",
      uplineId: leader1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "SALES002",
    },
  });

  const sales3 = await prisma.user.create({
    data: {
      email: "sales3@grabhealth.com",
      password: hashedPassword,
      firstName: "Charlie",
      lastName: "Sales",
      role: "SALES",
      uplineId: leader2.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "SALES003",
    },
  });

  // Regular Users
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      password: hashedPassword,
      firstName: "David",
      lastName: "User",
      role: "USER",
      uplineId: sales1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "USER001",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      password: hashedPassword,
      firstName: "Emma",
      lastName: "User",
      role: "USER",
      uplineId: sales1.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "USER002",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "user3@example.com",
      password: hashedPassword,
      firstName: "Frank",
      lastName: "User",
      role: "USER",
      uplineId: sales2.id,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      referralCode: "USER003",
    },
  });

  // Create user memberships for all users
  const allUsers = [company, manager1, manager2, leader1, leader2, leader3, sales1, sales2, sales3, user1, user2, user3];
  for (const user of allUsers) {
    await prisma.userMembership.create({
      data: {
        userId: user.id,
        tierId: freeTier.id,
        status: "ACTIVE",
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

  // Create products with basic pricing
  const products = [
    {
      name: "Vitamin C 1000mg",
      description: "High-potency Vitamin C supplement for immune support",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",
      price: 29.99,
    },
    {
      name: "Multivitamin Complex",
      description: "Complete daily multivitamin with essential nutrients",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop",
      price: 39.99,
    },
    {
      name: "Omega-3 Fish Oil",
      description: "Premium fish oil supplement for heart health",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop",
      price: 34.99,
    },
    {
      name: "Organic Shampoo",
      description: "Natural organic shampoo for all hair types",
      categoryId: categories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1629256926539-82164ff8f4c7?w=400&h=300&fit=crop",
      price: 19.99,
    },
    {
      name: "Hand Sanitizer Pack",
      description: "Antibacterial hand sanitizer 3-pack",
      categoryId: categories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop",
      price: 14.99,
    },
    {
      name: "Protein Powder - Vanilla",
      description: "Premium whey protein powder for muscle building",
      categoryId: categories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1609045567763-79fc7d1ba2ad?w=400&h=300&fit=crop",
      price: 49.99,
    },
    {
      name: "Pre-Workout Energy",
      description: "Advanced pre-workout formula for intense training",
      categoryId: categories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
      price: 39.99,
    },
    {
      name: "Herbal Tea Collection",
      description: "Assorted organic herbal teas for wellness",
      categoryId: categories[3].id,
      imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
      price: 24.99,
    },
    {
      name: "Turmeric Capsules",
      description: "Natural turmeric supplement for inflammation support",
      categoryId: categories[3].id,
      imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&h=300&fit=crop",
      price: 29.99,
    },
    {
      name: "Ginseng Extract",
      description: "Premium ginseng extract for energy and vitality",
      categoryId: categories[3].id,
      imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
      price: 44.99,
    },
    // Additional products for better variety
    {
      name: "Vitamin D3 5000 IU",
      description: "High-strength Vitamin D supplement for bone health",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1614961908836-2f1c3f1cf514?w=400&h=300&fit=crop",
      price: 24.99,
    },
    {
      name: "Probiotic Complex",
      description: "Advanced probiotic formula with 50 billion CFU",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop",
      price: 45.99,
    },
    {
      name: "Collagen Peptides",
      description: "Hydrolyzed collagen for skin, hair, and joint health",
      categoryId: categories[0].id,
      imageUrl: "https://images.unsplash.com/photo-1609902726285-00668009f004?w=400&h=300&fit=crop",
      price: 39.99,
    },
    {
      name: "Natural Face Cream",
      description: "Organic moisturizing face cream with SPF 30",
      categoryId: categories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop",
      price: 34.99,
    },
    {
      name: "Essential Oil Set",
      description: "Premium essential oils collection for aromatherapy",
      categoryId: categories[1].id,
      imageUrl: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=400&h=300&fit=crop",
      price: 49.99,
    },
    {
      name: "BCAA Powder",
      description: "Branched-chain amino acids for muscle recovery",
      categoryId: categories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop",
      price: 35.99,
    },
    {
      name: "Creatine Monohydrate",
      description: "Pure creatine powder for strength and power",
      categoryId: categories[2].id,
      imageUrl: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&h=300&fit=crop",
      price: 29.99,
    },
    {
      name: "Ashwagandha Root",
      description: "Adaptogenic herb for stress relief and energy",
      categoryId: categories[3].id,
      imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=300&fit=crop",
      price: 32.99,
    },
    {
      name: "Green Superfood Blend",
      description: "Nutrient-dense powder with spirulina and chlorella",
      categoryId: categories[3].id,
      imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop",
      price: 54.99,
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: product,
      })
    )
  );

  // Create product commission tiers for each product
  for (const product of createdProducts) {
    await prisma.productCommissionTier.create({
      data: {
        productId: product.id,
        productName: product.name,
        retailPrice: product.price,
        traderPrice: product.price * 0.9, // 10% discount for traders
        distributorPrice: product.price * 0.8, // 20% discount for distributors
        traderCommissionMin: product.price * 0.05, // 5% minimum commission
        traderCommissionMax: product.price * 0.1, // 10% maximum commission
        distributorCommissionMin: product.price * 0.1, // 10% minimum commission
        distributorCommissionMax: product.price * 0.15, // 15% maximum commission
      },
    });
  }

  // Create sample orders with different statuses
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: "COMPLETED",
      shippingAddress: "123 Main St, City, State 12345",
      billingAddress: "123 Main St, City, State 12345",
      paymentMethod: "CREDIT_CARD",
      paymentStatus: "PAID",
      subtotal: 94.97,
      discount: 0,
      tax: 7.60,
      total: 102.57,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 2,
            price: 29.99,
          },
          {
            productId: createdProducts[2].id,
            quantity: 1,
            price: 34.99,
          },
        ],
      },
    },
  });

  const _order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: "PROCESSING",
      shippingAddress: "456 Oak Ave, City, State 12346",
      billingAddress: "456 Oak Ave, City, State 12346",
      paymentMethod: "PAYPAL",
      paymentStatus: "PAID",
      subtotal: 89.98,
      discount: 0,
      tax: 7.20,
      total: 97.18,
      items: {
        create: [
          {
            productId: createdProducts[5].id,
            quantity: 1,
            price: 49.99,
          },
          {
            productId: createdProducts[6].id,
            quantity: 1,
            price: 39.99,
          },
        ],
      },
    },
  });

  const _order3 = await prisma.order.create({
    data: {
      userId: sales1.id,
      status: "PENDING",
      shippingAddress: "789 Pine Rd, City, State 12347",
      billingAddress: "789 Pine Rd, City, State 12347",
      paymentMethod: "CREDIT_CARD",
      paymentStatus: "PENDING",
      subtotal: 74.97,
      discount: 0,
      tax: 6.00,
      total: 80.97,
      items: {
        create: [
          {
            productId: createdProducts[1].id,
            quantity: 1,
            price: 39.99,
          },
          {
            productId: createdProducts[3].id,
            quantity: 2,
            price: 19.99,
          },
        ],
      },
    },
  });

  // Create sample commissions from order1
  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: sales1.id,
      orderId: order1.id,
      amount: 10.26, // 10% of order total
      commissionRate: 0.1,
      relationshipLevel: 1,
      type: "DIRECT",
      status: "PAID",
    },
  });

  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: leader1.id,
      orderId: order1.id,
      amount: 5.13, // 5% of order total
      commissionRate: 0.05,
      relationshipLevel: 2,
      type: "INDIRECT",
      status: "PAID",
    },
  });

  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: manager1.id,
      orderId: order1.id,
      amount: 3.08, // 3% of order total
      commissionRate: 0.03,
      relationshipLevel: 3,
      type: "INDIRECT",
      status: "PAID",
    },
  });

  await prisma.commission.create({
    data: {
      userId: user1.id,
      recipientId: company.id,
      orderId: order1.id,
      amount: 2.05, // 2% of order total
      commissionRate: 0.02,
      relationshipLevel: 4,
      type: "INDIRECT",
      status: "PAID",
    },
  });

  // Create commission tiers
  const commissionTiers = [
    { tierLevel: 1, tierName: "Direct Sales", directCommissionRate: 0.1, indirectCommissionRate: 0, pointsRate: 100 },
    { tierLevel: 2, tierName: "Level 2", directCommissionRate: 0, indirectCommissionRate: 0.05, pointsRate: 50 },
    { tierLevel: 3, tierName: "Level 3", directCommissionRate: 0, indirectCommissionRate: 0.03, pointsRate: 30 },
    { tierLevel: 4, tierName: "Level 4", directCommissionRate: 0, indirectCommissionRate: 0.02, pointsRate: 20 },
  ];

  for (const tier of commissionTiers) {
    await prisma.commissionTier.create({ data: tier });
  }

  console.log("Seed data created successfully!");
  console.log("\nTest Credentials:");
  console.log("================");
  console.log("All passwords: TestPass@123");
  console.log("\nSuper Admin: super.admin@grabhealth.com");
  console.log("Company: company@grabhealth.com");
  console.log("Managers: manager1@grabhealth.com, manager2@grabhealth.com");
  console.log(
    "Leaders: leader1@grabhealth.com, leader2@grabhealth.com, leader3@grabhealth.com"
  );
  console.log(
    "Sales: sales1@grabhealth.com, sales2@grabhealth.com, sales3@grabhealth.com"
  );
  console.log("Users: user1@example.com, user2@example.com, user3@example.com");
  console.log("\nMLM Structure:");
  console.log("Company -> Managers -> Leaders -> Sales -> Users");
  console.log("\nProducts: 19 products created across 4 categories");
  console.log("Orders: 3 sample orders with different statuses");
  console.log("Commissions: Sample commission structure for order1");
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
