/**
 * Seed data for categories and products
 */

export const categories = [
  {
    name: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    description: "Essential vitamins and dietary supplements for optimal health",
    isActive: true,
    sortOrder: 1
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Products for overall health and wellness",
    isActive: true,
    sortOrder: 2
  },
  {
    name: "Fitness & Sports Nutrition",
    slug: "fitness-sports-nutrition",
    description: "Sports supplements and fitness nutrition products",
    isActive: true,
    sortOrder: 3
  },
  {
    name: "Personal Care",
    slug: "personal-care",
    description: "Personal care and hygiene products",
    isActive: true,
    sortOrder: 4
  },
  {
    name: "Medical Devices",
    slug: "medical-devices",
    description: "Home medical devices and health monitoring equipment",
    isActive: true,
    sortOrder: 5
  },
  {
    name: "Traditional Medicine",
    slug: "traditional-medicine",
    description: "Traditional Chinese Medicine and herbal products",
    isActive: true,
    sortOrder: 6
  }
];

export const products = [
  // Vitamins & Supplements
  {
    categorySlug: "vitamins-supplements",
    items: [
      {
        name: "Multivitamin Complex",
        description: "Complete daily multivitamin with essential nutrients for adults",
        sku: "VIT-MULTI-001",
        price: 45.00,
        qty: 100,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Vitamin C 1000mg",
        description: "High-potency vitamin C for immune support",
        sku: "VIT-C-1000",
        price: 28.00,
        qty: 150,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Omega-3 Fish Oil",
        description: "Premium fish oil supplement for heart and brain health",
        sku: "OMEGA3-001",
        price: 55.00,
        qty: 80,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Vitamin D3 5000IU",
        description: "High-strength vitamin D3 for bone health and immunity",
        sku: "VIT-D3-5000",
        price: 35.00,
        qty: 120,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Probiotics 50 Billion CFU",
        description: "Advanced probiotic formula for digestive health",
        sku: "PROB-50B",
        price: 65.00,
        qty: 60,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  },
  // Health & Wellness
  {
    categorySlug: "health-wellness",
    items: [
      {
        name: "Immune Boost Formula",
        description: "Comprehensive immune support with elderberry and zinc",
        sku: "IMM-BOOST-001",
        price: 48.00,
        qty: 90,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Sleep Support Gummies",
        description: "Natural melatonin gummies for better sleep",
        sku: "SLEEP-GUM-001",
        price: 32.00,
        qty: 110,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Stress Relief Complex",
        description: "Adaptogenic herbs for stress management",
        sku: "STRESS-REL-001",
        price: 42.00,
        qty: 75,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Joint Support Formula",
        description: "Glucosamine and chondroitin for joint health",
        sku: "JOINT-SUP-001",
        price: 58.00,
        qty: 65,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  },
  // Fitness & Sports Nutrition
  {
    categorySlug: "fitness-sports-nutrition",
    items: [
      {
        name: "Whey Protein Powder - Vanilla",
        description: "Premium whey protein isolate for muscle recovery",
        sku: "WHEY-VAN-001",
        price: 75.00,
        qty: 50,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Pre-Workout Energy Blend",
        description: "Natural pre-workout supplement for enhanced performance",
        sku: "PRE-WORK-001",
        price: 45.00,
        qty: 85,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "BCAA Recovery Drink",
        description: "Branched-chain amino acids for muscle recovery",
        sku: "BCAA-REC-001",
        price: 52.00,
        qty: 70,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Creatine Monohydrate",
        description: "Pure creatine for strength and muscle building",
        sku: "CREAT-MONO-001",
        price: 38.00,
        qty: 95,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  },
  // Personal Care
  {
    categorySlug: "personal-care",
    items: [
      {
        name: "Organic Hand Sanitizer",
        description: "Alcohol-free organic hand sanitizer with aloe vera",
        sku: "HAND-SAN-001",
        price: 12.00,
        qty: 200,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Natural Face Masks (50 pack)",
        description: "Biodegradable face masks for daily protection",
        sku: "MASK-NAT-50",
        price: 25.00,
        qty: 150,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Antibacterial Soap Set",
        description: "Natural antibacterial soap bars (4 pack)",
        sku: "SOAP-ANTI-4",
        price: 28.00,
        qty: 120,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  },
  // Medical Devices
  {
    categorySlug: "medical-devices",
    items: [
      {
        name: "Digital Blood Pressure Monitor",
        description: "Automatic arm blood pressure monitor with memory function",
        sku: "BP-MON-001",
        price: 85.00,
        qty: 40,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Pulse Oximeter",
        description: "Fingertip pulse oximeter for oxygen saturation monitoring",
        sku: "PULSE-OX-001",
        price: 45.00,
        qty: 80,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Digital Thermometer",
        description: "Non-contact infrared forehead thermometer",
        sku: "THERM-DIG-001",
        price: 58.00,
        qty: 90,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Blood Glucose Monitor Kit",
        description: "Complete blood glucose monitoring system with test strips",
        sku: "GLUC-MON-KIT",
        price: 68.00,
        qty: 50,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  },
  // Traditional Medicine
  {
    categorySlug: "traditional-medicine",
    items: [
      {
        name: "Ginseng Extract Capsules",
        description: "Premium Korean red ginseng for energy and vitality",
        sku: "GINS-EXT-001",
        price: 88.00,
        qty: 60,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Cordyceps Supplement",
        description: "Wild cordyceps extract for immune support",
        sku: "CORD-SUP-001",
        price: 125.00,
        qty: 30,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Traditional Herbal Tea Blend",
        description: "Calming herbal tea with chamomile and lavender",
        sku: "HERB-TEA-001",
        price: 32.00,
        qty: 100,
        inStock: true,
        productStatus: "ACTIVE"
      },
      {
        name: "Turmeric Curcumin Complex",
        description: "High-absorption turmeric with black pepper extract",
        sku: "TURM-CURC-001",
        price: 42.00,
        qty: 85,
        inStock: true,
        productStatus: "ACTIVE"
      }
    ]
  }
];