// Client-side commission utilities

/**
 * Initialize commission system on the client side
 * This function is a client-side wrapper that calls the API to initialize commission tables
 */
export async function initializeCommissionSystem(): Promise<boolean> {
  try {
    // Make a simple request to the commission API which will initialize tables on the server
    const response = await fetch('/api/commission', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        'Failed to initialize commission system:',
        response.statusText
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing commission system:', error);
    return false;
  }
}
