import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get membership stats
    const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const membershipStats = await sql`
      SELECT 
        mt.name as tier, 
        COUNT(um.id) as count
      FROM membership_tiers mt
      LEFT JOIN user_memberships um ON mt.id = um.tier_id
      GROUP BY mt.name
    `;

    // Get product stats
    const productStats = await sql`
      SELECT 
        pc.name as category, 
        COUNT(p.id) as count
      FROM product_categories pc
      LEFT JOIN products p ON pc.id = p.category_id
      GROUP BY pc.name
    `;

    // Get gift claim stats
    const claimStats = await sql`
      SELECT 
        mt.name as tier,
        COUNT(gc.id) as count
      FROM membership_tiers mt
      JOIN gift_items gi ON mt.id = gi.tier_id
      LEFT JOIN gift_claims gc ON gi.id = gc.gift_id
      GROUP BY mt.name
    `;

    return NextResponse.json({
      users: {
        total: Number.parseInt(totalUsers[0].count),
        byTier: membershipStats.reduce((acc: any, curr: any) => {
          acc[curr.tier] = Number.parseInt(curr.count);
          return acc;
        }, {}),
      },
      products: {
        byCategory: productStats.reduce((acc: any, curr: any) => {
          acc[curr.category] = Number.parseInt(curr.count);
          return acc;
        }, {}),
      },
      claims: {
        byTier: claimStats.reduce((acc: any, curr: any) => {
          acc[curr.tier] = Number.parseInt(curr.count);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
