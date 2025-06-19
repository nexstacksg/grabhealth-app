import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log('🌱 Seeding GrabHealth 4-Product Commission System...');

  try {
    // Define the 4 products with their specifications
    const products = [
      {
        name: 'Real Man',
        description: 'Premium health supplement for men',
        sku: 'REAL_MAN_001',
        status: 'ACTIVE',
        pricing: {
          pvValue: 600,
          customerPrice: 3600.00,
          travelPackagePrice: 799.00,
          costPrice: 1800.00, // Hidden from customers
        },
        commissions: {
          salesCommissionAmount: 1080.00,   // 30% of $3,600
          leaderCommissionAmount: 360.00,   // 10% of $3,600
          managerCommissionAmount: 180.00,  // 5% of $3,600
        }
      },
      {
        name: 'Wild Ginseng Honey',
        description: 'Premium wild ginseng honey blend',
        sku: 'GINSENG_HONEY_001',
        status: 'ACTIVE',
        pricing: {
          pvValue: 700,
          customerPrice: 1000.00,
          travelPackagePrice: null,
          costPrice: 500.00, // Hidden from customers
        },
        commissions: {
          salesCommissionAmount: 300.00,   // 30% of $1,000
          leaderCommissionAmount: 100.00,  // 10% of $1,000
          managerCommissionAmount: 50.00,  // 5% of $1,000
        }
      },
      {
        name: 'Golden Ginseng Water',
        description: 'Premium golden ginseng infused water',
        sku: 'GOLDEN_WATER_001',
        status: 'ACTIVE',
        pricing: {
          pvValue: 2000,
          customerPrice: 18.90,
          travelPackagePrice: null,
          costPrice: 9.45, // Hidden from customers
        },
        commissions: {
          salesCommissionAmount: 5.67,    // 30% of $18.90
          leaderCommissionAmount: 1.89,   // 10% of $18.90
          managerCommissionAmount: 0.95,  // 5% of $18.90
        }
      },
      {
        name: 'Travel Package',
        description: 'Complete health and wellness travel package',
        sku: 'TRAVEL_PKG_001',
        status: 'ACTIVE',
        pricing: {
          pvValue: 500,
          customerPrice: 799.00,
          travelPackagePrice: null,
          costPrice: 400.00, // Hidden from customers
        },
        commissions: {
          salesCommissionAmount: 239.70,  // 30% of $799
          leaderCommissionAmount: 79.90,  // 10% of $799
          managerCommissionAmount: 39.95, // 5% of $799
        }
      }
    ];

    // Create products with their pricing and commission structure
    for (const productData of products) {
      console.log(`Creating product: ${productData.name}`);
      
      // Create or update product
      const product = await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {
          name: productData.name,
          description: productData.description,
          status: productData.status,
        },
        create: {
          name: productData.name,
          description: productData.description,
          sku: productData.sku,
          status: productData.status,
        },
      });

      // Create or update product pricing
      await prisma.productPricing.upsert({
        where: { productId: product.id },
        update: {
          pvValue: productData.pricing.pvValue,
          customerPrice: productData.pricing.customerPrice,
          travelPackagePrice: productData.pricing.travelPackagePrice,
          costPrice: productData.pricing.costPrice,
        },
        create: {
          productId: product.id,
          pvValue: productData.pricing.pvValue,
          customerPrice: productData.pricing.customerPrice,
          travelPackagePrice: productData.pricing.travelPackagePrice,
          costPrice: productData.pricing.costPrice,
        },
      });

      // Create or update product commission tiers
      await prisma.productCommissionTier.upsert({
        where: { productId: product.id },
        update: {
          productName: productData.name,
          salesCommissionAmount: productData.commissions.salesCommissionAmount,
          leaderCommissionAmount: productData.commissions.leaderCommissionAmount,
          managerCommissionAmount: productData.commissions.managerCommissionAmount,
          salesCommissionRate: 0.30,
          leaderCommissionRate: 0.10,
          managerCommissionRate: 0.05,
        },
        create: {
          productId: product.id,
          productName: productData.name,
          salesCommissionAmount: productData.commissions.salesCommissionAmount,
          leaderCommissionAmount: productData.commissions.leaderCommissionAmount,
          managerCommissionAmount: productData.commissions.managerCommissionAmount,
          salesCommissionRate: 0.30,
          leaderCommissionRate: 0.10,
          managerCommissionRate: 0.05,
        },
      });

      console.log(`✅ Created ${productData.name} with pricing and commission structure`);
    }

    // Create sample commission calculation summary
    console.log('\n📊 Commission Calculation Summary (for Sales role selling 1 unit each):');
    console.log('Real Man: $1,080.00 commission (30% of $3,600) + 600 PV');
    console.log('Wild Ginseng Honey: $300.00 commission (30% of $1,000) + 700 PV');
    console.log('Golden Ginseng Water: $5.67 commission (30% of $18.90) + 2,000 PV');
    console.log('Travel Package: $239.70 commission (30% of $799) + 500 PV');
    console.log('Total: $1,625.37 commission + 3,800 PV');

    console.log('\n🎉 Successfully seeded GrabHealth 4-Product Commission System!');

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedProducts()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedProducts };
