import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductImages() {
  console.log('🔧 Fixing product image URLs...\n');

  // Define the correct image URLs
  const imageUpdates = [
    {
      name: 'Real Man (真男人)',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/Real man1.png.png'
    },
    {
      name: 'Wild Ginseng Honey (蜜制野山参)',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/Ginseng honey.png.png'
    },
    {
      name: 'Golden Ginseng Water (金参水)',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/GoldenGinseng.png'
    },
    {
      name: 'Travel to Yunnan (云南)',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/TravelToYu.png'
    },
    {
      name: 'Travel to Bangkok (曼谷)',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/TravelToBkk.png'
    },
    // Also update if there's a generic "Travel Package"
    {
      name: 'Travel Package',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/TravelToYu.png'
    },
    // In case the products have slightly different names
    {
      name: 'Real Man',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/Real man1.png.png'
    },
    {
      name: 'Wild Ginseng Honey',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/Ginseng honey.png.png'
    },
    {
      name: 'Golden Ginseng Water',
      imageUrl: 'https://grab.sgp1.digitaloceanspaces.com/grabhealth/uploads/GoldenGinseng.png'
    }
  ];

  // Update each product
  for (const update of imageUpdates) {
    try {
      const result = await prisma.product.updateMany({
        where: {
          name: {
            contains: update.name.split(' (')[0] // Match by the main name part
          }
        },
        data: {
          imageUrl: update.imageUrl
        }
      });

      if (result.count > 0) {
        console.log(`✅ Updated ${update.name}: ${result.count} product(s)`);
      }
    } catch (error) {
      console.log(`⚠️  Could not update ${update.name}`);
    }
  }

  // List all products to verify
  console.log('\n📦 Current products in database:');
  const products = await prisma.product.findMany({
    select: {
      name: true,
      imageUrl: true
    }
  });

  products.forEach(product => {
    console.log(`- ${product.name}`);
    console.log(`  URL: ${product.imageUrl}`);
  });

  await prisma.$disconnect();
}

fixProductImages().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});