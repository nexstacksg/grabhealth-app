import { NextRequest, NextResponse } from 'next/server';
import {
  initializeProductCommissionTables,
  getProductCommissionTiers,
  getUserRoleTypes,
  getVolumeBonusTiers,
} from '@/lib/product-commission';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default values in case of errors
    let productTiers: any[] = [];
    let roleTypes: any[] = [];
    let volumeBonusTiers: any[] = [];

    // Initialize product commission tables if needed with error handling
    try {
      await initializeProductCommissionTables();
    } catch (initError) {
      console.error(
        'Error initializing product commission tables, but continuing:',
        initError
      );
      // Continue despite initialization error
    }

    // Get product commission tiers with error handling
    try {
      productTiers = await getProductCommissionTiers();
    } catch (productError) {
      console.error('Error fetching product commission tiers:', productError);
      // Use default empty array
    }

    // Get user role types with error handling
    try {
      roleTypes = await getUserRoleTypes();
    } catch (roleError) {
      console.error('Error fetching user role types:', roleError);
      // Use default empty array
    }

    // Get volume bonus tiers with error handling
    try {
      volumeBonusTiers = await getVolumeBonusTiers();
    } catch (volumeError) {
      console.error('Error fetching volume bonus tiers:', volumeError);
      // Use default empty array
    }

    // Return all commission structure data, even if some parts failed
    return NextResponse.json({
      productTiers,
      roleTypes,
      volumeBonusTiers,
    });
  } catch (error) {
    console.error('Error fetching commission structure:', error);
    // Return empty data instead of error to allow UI to render with defaults
    return NextResponse.json({
      productTiers: [],
      roleTypes: [],
      volumeBonusTiers: [],
    });
  }
}
