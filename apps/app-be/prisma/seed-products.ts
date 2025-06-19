import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProducts() {
  console.log(
    '🌱 Seeding GrabHealth 5-Product System (3 Products + 2 Travel Packages)...'
  );

  try {
    // Define the 3 products + 2 travel packages with their specifications
    const products = [
      {
        name: 'Real Man (真男人)',
        description: `Realman harnesses world-leading life sciences and extracts natural plant and animal essences, nutrients, trace elements, and minerals to create a complete health and vitality support system specifically for modern men.

From organ nourishment to hormonal balance, Realman enhances both physical performance and mental wellbeing—your natural health companion in everyday life.

Key Benefits:
• Boosts stamina, Restores energy, Enhances performance
• Supports kidney, reproductive, bone & ligament health
• Fights fatigue, Balances hormones, Strengthens glands
• Improves immunity, Enriched with wild ginseng saponins & polysaccharides
• Activates potential, Builds resilience, Natural vitality restoration

Ingredients (Per 8 capsules equivalent to raw herbs in mg):
• Ginseng Radix Et Rhizome (Wild Ginseng) 野山参 – 100mg
• Whole Deer Jerky 全鹿干 – 100mg
• Rehmannia Glutinosa Libosch 熟地黄 – 350mg
• Radix Curcumae 姜黄 – 200mg
• Fructus Lycii (Goji Berry) 枸杞子 – 200mg

Package: 1 box: 6 Bottles | Dosage: 3g per dose | Usage: Consume 1 bottle every 10 days

Who Should Use:
• Men who often stay up late, face high work pressure, or feel mentally drained
• Middle-aged men looking to improve stamina and immune strength
• Those seeking to improve vitality, kidney, and hormonal balance
• Modern men who value wellness and prefer natural health solutions`,
        sku: 'REAL_MAN_001',
        status: 'ACTIVE',
        imageUrl: '/uploads/realmen.jpeg',
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
        name: 'Wild Ginseng Honey (蜜制野山参)',
        description: `Millennium Ginseng Essence – The King of Herbs
Premium Honey-Infused Wild Ginseng
100% Natural Wild Ginseng · No Artificial Additives

For centuries, wild ginseng has been regarded as a rare treasure traditionally reserved for royalty. Especially prized is the wild ginseng harvested from the pristine forests of Changbai Mountain, located at the golden latitude of 43° — a natural sanctuary where ginseng thrives for over 15 years in untouched wilderness.

Rich in over 100 natural active compounds beneficial to human health, wild ginseng is renowned for its remarkable ability to combat fatigue, slow aging, and holistically enhance the body's vitality and performance.

Key Benefits:
• Restore Vital Energy: Rapidly replenishes depleted energy, strengthens the body against fatigue, and supports recovery from exhaustion, surgery, or chronic depletion. Promotes energy balance and metabolic health.
• Increase Hormone & Blood Creation: Relieves dryness in mouth and throat caused by heat or dry environments, and harmonizes internal functions.
• Calm the Mind & Relieve Stress: Promotes restful sleep, alleviates tension caused by daily stress, and improves focus and mental clarity.
• Enhance Immunity & Mental Performance: Supports brain function, improves memory, and revitalizes the body for sustained energy and overall well-being.

Ingredients:
• Fresh Wild Ginseng (Changbai Mountain) – 12g
• Pure Honey (Changbai Mountain) – 18g
• Net Weight: 30g / Bottle

Direction for use:
• For Health Boost: Consume 1 bottle every 6 days
• For Immune Support: Consume 1 bottle every 3 days

Who Should Use:
• Students & Exam Takers • Busy Professionals & Entrepreneurs • Middle-aged & Elderly Adults
• Men Seeking Vitality • Frequent Drinkers • Wellness Enthusiasts • Low Energy / Fatigue-Prone Individuals`,
        sku: 'GINSENG_HONEY_001',
        status: 'ACTIVE',
        imageUrl: '/uploads/WildGinseng.png',
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
        name: 'Golden Ginseng Water (金参水)',
        description: `Golden Ginseng Water is a premium health beverage infused with whole, high-grade ginseng roots — naturally steeped to preserve its golden essence and rich bioactive compounds.

💧 Pure & Potent: Each bottle contains the power of real ginseng, known for boosting energy, enhancing immunity, and promoting overall wellness.

🎁 Elegant & Natural: With its luxurious golden hue and visible root, it's not just a drink — it's a statement of vitality and refined taste.

Key Benefits:
• Natural Energy Booster
• Enhances Mental Focus
• Supports Immunity
• Improves Circulation and Metabolism
• Skin and Anti-Aging Benefits
• Balances Hormones

Ingredients:
• GINSENG RADIX ET RHIZOME 人参
• CHRYSANTHEMUM MORIFOLIUM 杭白菊
• JASMINUM SAMBAC 茉莉花
• TUBER MELANOSPORUM 黑松露
• POLYGORATUM 黄精
• WOLFBERRY 枸杞子
• RADIX PUERARIAE 葛根
• MOGROSIDE 罗汉果甜苷
• ISOMALTO-OLIGOSACCHARIDE 低聚异麦芽糖液
• ERYTHRITOL 赤藓糖醇
• D-SODIUM ERYTHORBATE D-异抗坏血酸钠
• SUCRALOSE 三氯蔗糖

Who Should Use:
• Students & Exam Takers • Busy Professionals & Entrepreneurs • Middle-aged & Elderly Adults
• Men Seeking Vitality • Frequent Drinkers • Wellness Enthusiasts • Low Energy / Fatigue-Prone Individuals`,
        sku: 'GOLDEN_WATER_001',
        status: 'ACTIVE',
        imageUrl: '/uploads/GoldenGinseng.png',
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
        name: 'Travel to Yunnan (云南)',
        description: `Experience the natural beauty and traditional medicine heritage of Yunnan Province

Yunnan Travel Package includes:
• 7-day wellness retreat in Yunnan's pristine mountains
• Accommodation at premium eco-wellness resorts
• Traditional Chinese Medicine consultations and treatments
• Guided tours of ancient medicinal herb gardens
• Visits to traditional tea plantations and processing facilities
• Educational sessions on Traditional Chinese Medicine (TCM)
• Authentic Yunnan cuisine featuring medicinal ingredients
• Cultural immersion with local ethnic minorities
• Spa treatments using local herbs and natural hot springs
• Professional photography sessions in scenic locations

Highlights:
• Explore Dali Ancient City and its traditional medicine markets
• Visit Lijiang's UNESCO World Heritage sites
• Experience Shangri-La's Tibetan medicine traditions
• Learn about high-altitude medicinal plants and herbs

Perfect for:
• Health and wellness enthusiasts
• Those interested in Traditional Chinese Medicine
• Cultural travelers seeking authentic experiences
• Groups looking for educational health retreats`,
        sku: 'TRAVEL_YUNNAN_001',
        status: 'ACTIVE',
        imageUrl: '/uploads/TravelToYu.png',
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
      {
        name: 'Travel to Bangkok (曼谷)',
        description: `Explore Thailand's vibrant culture and wellness traditions in the heart of Bangkok

Bangkok Travel Package includes:
• 7-day wellness and cultural immersion experience
• Accommodation at luxury wellness hotels in central Bangkok
• Traditional Thai massage and spa treatments
• Guided tours of ancient temples and wellness centers
• Thai cooking classes featuring healthy, medicinal cuisine
• Visits to traditional medicine markets and herb shops
• Educational sessions on Thai traditional medicine
• Muay Thai wellness training sessions
• Meditation and mindfulness workshops at Buddhist temples
• Professional wellness consultations with Thai practitioners

Highlights:
• Explore Wat Pho Temple and traditional Thai massage school
• Visit Chatuchak Weekend Market's herbal medicine section
• Experience floating market wellness boat tours
• Learn about Thai herbs and their medicinal properties
• Enjoy royal Thai spa treatments at luxury wellness centers

Cultural Experiences:
• Traditional Thai dance and music performances
• Temple meditation sessions with Buddhist monks
• Local community wellness projects participation
• Authentic street food tours focusing on healthy options

Perfect for:
• Wellness enthusiasts seeking exotic experiences
• Those interested in Thai traditional medicine and culture
• Travelers looking for luxury wellness retreats
• Groups seeking cultural immersion with health focus`,
        sku: 'TRAVEL_BANGKOK_001',
        status: 'ACTIVE',
        imageUrl: '/uploads/TravelToBkk.png',
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
          imageUrl: productData.imageUrl,
        },
        create: {
          name: productData.name,
          description: productData.description,
          sku: productData.sku,
          status: productData.status,
          imageUrl: productData.imageUrl,
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
          leaderCommissionAmount:
            productData.commissions.leaderCommissionAmount,
          managerCommissionAmount:
            productData.commissions.managerCommissionAmount,
          salesCommissionRate: 0.3,
          leaderCommissionRate: 0.1,
          managerCommissionRate: 0.05,
        },
        create: {
          productId: product.id,
          productName: productData.name,
          salesCommissionAmount: productData.commissions.salesCommissionAmount,
          leaderCommissionAmount:
            productData.commissions.leaderCommissionAmount,
          managerCommissionAmount:
            productData.commissions.managerCommissionAmount,
          salesCommissionRate: 0.3,
          leaderCommissionRate: 0.1,
          managerCommissionRate: 0.05,
        },
      });

      console.log(
        `✅ Created ${productData.name} with pricing and commission structure`
      );
    }

    // Create sample commission calculation summary
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
    console.log('Travel to Yunnan: $239.70 commission (30% of $799) + 500 PV');
    console.log('Travel to Bangkok: $239.70 commission (30% of $799) + 500 PV');
    console.log('Total: $1,865.07 commission + 4,300 PV');

    console.log(
      '\n🎉 Successfully seeded GrabHealth 5-Product System (3 Products + 2 Travel Packages)!'
    );
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedProducts().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedProducts };
