import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  initializeCommissionTables,
  getUserUpline,
  getUserDownlines,
  getUserCommissions,
  getUserPoints,
  generateReferralLink,
} from '@/lib/commission';

// Initialize tables and get current user's commission data
export async function GET() {
  try {
    // Get current user first to ensure authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize commission tables with error handling
    try {
      await initializeCommissionTables();
    } catch (initError) {
      console.error(
        'Error initializing commission tables, but continuing:',
        initError
      );
      // Continue despite initialization error
    }

    // Default values in case of errors
    let upline = null;
    let downlines: any[] = [];
    let commissions: any[] = [];
    let points = 0;
    let referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://grab-health-ai.vercel.app'}/auth/register?referrer=${user.id}`;

    // Get user's upline (supervisor) with error handling
    try {
      upline = await getUserUpline(user.id);
    } catch (uplineError) {
      console.error('Error fetching upline:', uplineError);
    }

    // Get user's downlines with error handling
    try {
      downlines = await getUserDownlines(user.id);
    } catch (downlinesError) {
      console.error('Error fetching downlines:', downlinesError);
    }

    // Get user's commissions with error handling
    try {
      commissions = await getUserCommissions(user.id);
    } catch (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
    }

    // Get user's points with error handling
    try {
      points = await getUserPoints(user.id);
    } catch (pointsError) {
      console.error('Error fetching points:', pointsError);
    }

    // Generate referral link with error handling
    try {
      referralLink = await generateReferralLink(user.id);
    } catch (referralError) {
      console.error('Error generating referral link:', referralError);
    }

    // Return all commission data
    return NextResponse.json({
      upline,
      downlines,
      commissions,
      points,
      referralLink,
    });
  } catch (error) {
    console.error('Error fetching commission data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission data' },
      { status: 500 }
    );
  }
}
