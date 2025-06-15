import services from '@/lib/services';

/**
 * Initialize commission system on the client side
 * This function is a client-side wrapper that calls the API to initialize commission tables
 */
export async function initializeCommissionSystem(): Promise<boolean> {
  try {
    await services.commission.initializeCommissionSystem();
    return true;
  } catch (error) {
    console.error('Error initializing commission system:', error);
    return false;
  }
}
