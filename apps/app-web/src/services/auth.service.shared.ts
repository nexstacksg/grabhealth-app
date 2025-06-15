import { AuthService, ApiAuthDataSource } from '@app/shared-services';
import { cookies } from 'next/headers';

// Helper to get access token
async function getAccessToken(): Promise<string | null> {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('accessToken');
      return token?.value || null;
    } catch {
      return null;
    }
  } else {
    // On client, cookies are sent automatically
    return null;
  }
}

// Create auth service instance
const createAuthService = () => {
  const apiUrl = typeof window === 'undefined' 
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    : '/api';

  return new AuthService({
    dataSource: new ApiAuthDataSource(
      apiUrl,
      getAccessToken
    )
  });
};

// Export a singleton instance
export const authServiceShared = createAuthService();
export default authServiceShared;