/**
 * Seed script to populate categories and products
 */

import type { Core } from '@strapi/strapi';
import { categories, products } from './product-seed';

export default async function seedProducts(strapi: Core.Strapi) {
  console.log('🌱 Starting product seeding...');

  try {
    // Store created category IDs
    const categoryMap = new Map<string, any>();

    // 1. Create Categories
    console.log('📂 Creating categories...');
    for (const categoryData of categories) {
      const existingCategory = await strapi.entityService.findMany(
        'api::category.category',
        {
          filters: { slug: categoryData.slug },
          limit: 1
        } as any
      );

      if (!existingCategory || existingCategory.length === 0) {
        const category = await strapi.entityService.create('api::category.category', {
          data: {
            ...categoryData,
            publishedAt: new Date() // Publish immediately
          }
        } as any);
        categoryMap.set(categoryData.slug, category);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        categoryMap.set(categoryData.slug, existingCategory[0]);
        console.log(`ℹ️  Category already exists: ${existingCategory[0].name}`);
      }
    }

    // 2. Create Products for each category
    console.log('\n📦 Creating products...');
    for (const productGroup of products) {
      const category = categoryMap.get(productGroup.categorySlug);
      
      if (!category) {
        console.log(`❌ Category not found: ${productGroup.categorySlug}`);
        continue;
      }

      console.log(`\n📍 Creating products for ${category.name}...`);

      for (const productData of productGroup.items) {
        const existingProduct = await strapi.entityService.findMany(
          'api::product.product',
          {
            filters: { sku: productData.sku },
            limit: 1
          } as any
        );

        if (!existingProduct || existingProduct.length === 0) {
          const product = await strapi.entityService.create('api::product.product', {
            data: {
              ...productData,
              category: category.id, // Link to category
              publishedAt: new Date() // Publish immediately
            }
          } as any);
          console.log(`✅ Created product: ${product.name} (${product.sku})`);
        } else {
          console.log(`ℹ️  Product already exists: ${existingProduct[0].name} (${existingProduct[0].sku})`);
        }
      }
    }

    console.log('\n✨ Product seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error during product seeding:', error);
    return false;
  }
}