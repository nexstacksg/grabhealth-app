/**
 * Seed script to create product variants for existing products
 */

export async function seedProductVariants(strapi: any) {
  try {
    console.log('🌱 Starting product variants seeding...');

    // Find the Golden Ginseng Water product
    const products = await strapi.documents('api::product.product').findMany({
      filters: {
        name: {
          $containsi: 'Golden Ginseng Water'
        }
      }
    });

    if (products.length === 0) {
      console.log('❌ Golden Ginseng Water product not found');
      return;
    }

    const product = products[0];
    console.log(`✅ Found product: ${product.name} (${product.documentId})`);

    // Check if variants already exist
    const existingVariants = await strapi.documents('api::product-variant.product-variant').findMany({
      filters: {
        product: {
          documentId: product.documentId
        }
      }
    });

    if (existingVariants.length > 0) {
      console.log(`ℹ️  Product already has ${existingVariants.length} variants, skipping...`);
      return;
    }

    // Create variants
    const variants = [
      {
        name: 'Single Bottle',
        sku: `${product.sku}-1`,
        price: 28.70,
        unitQuantity: 1,
        unitLabel: 'bottle',
        savingsAmount: 0,
        isMostPopular: false,
        stock: 100,
        product: product.documentId
      },
      {
        name: 'Box of 20 Bottles',
        sku: `${product.sku}-20`,
        price: 378,
        unitQuantity: 20,
        unitLabel: 'bottle',
        savingsAmount: 196, // (28.70 * 20) - 378 = 196
        isMostPopular: true,
        stock: 50,
        product: product.documentId
      }
    ];

    for (const variantData of variants) {
      const variant = await strapi.documents('api::product-variant.product-variant').create({
        data: variantData
      });
      console.log(`✅ Created variant: ${variant.name}`);
    }

    console.log('🎉 Product variants seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding product variants:', error);
    throw error;
  }
}

// Export function that can be called from bootstrap
export default async ({ strapi }: { strapi: any }) => {
  await seedProductVariants(strapi);
};