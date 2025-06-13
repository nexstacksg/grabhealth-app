import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const tiers = await sql`
      SELECT * FROM membership_tiers
      ORDER BY id
    `;

    // Transform the data to include features
    const transformedTiers = tiers.map((tier: any) => {
      const features = [];

      if (tier.name === 'Essential') {
        features.push(
          { name: 'Discount on health products', value: '10%' },
          { name: 'Discount on partner lab tests', value: '5%' },
          { name: 'Free shipping', value: 'Over minimum order' },
          { name: 'Member-only offers', value: true },
          { name: 'Monthly free gift claim', value: 'Basic gifts' },
          { name: 'Family sharing', value: false },
          { name: 'Priority clinic bookings', value: false },
          { name: 'Early access to promotions', value: false }
        );
      } else if (tier.name === 'Premium') {
        features.push(
          { name: 'Discount on health products', value: '25%' },
          { name: 'Discount on partner lab tests', value: '15-20%' },
          { name: 'Free shipping', value: 'All orders' },
          { name: 'Member-only offers', value: true },
          { name: 'Monthly free gift claim', value: 'Premium gifts' },
          { name: 'Family sharing', value: 'Up to 4 members' },
          { name: 'Priority clinic bookings', value: true },
          { name: 'Early access to promotions', value: true }
        );
      }

      return {
        ...tier,
        price: tier.name === 'Essential' ? 'Free' : 'Free Upgrade',
        features,
        cta: tier.name === 'Essential' ? 'Join Now' : 'Learn How to Upgrade',
        popular: tier.name === 'Premium',
      };
    });

    return NextResponse.json(transformedTiers);
  } catch (error) {
    console.error('Error fetching membership tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership tiers' },
      { status: 500 }
    );
  }
}
