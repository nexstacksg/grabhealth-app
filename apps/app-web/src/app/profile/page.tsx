import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';

async function getUser() {
  const cookieStore = await cookies();
  
  // Debug: Log ALL cookies
  const allCookies = cookieStore.getAll();
  console.log('=== DEBUG: Server-side cookies ===');
  console.log('All cookies:', allCookies);
  console.log('Cookie count:', allCookies.length);
  allCookies.forEach(cookie => {
    console.log(`Cookie: ${cookie.name} = ${cookie.value.substring(0, 20)}...`);
  });
  
  const token = cookieStore.get('accessToken');
  console.log('AccessToken cookie found:', !!token);
  console.log('AccessToken value:', token?.value?.substring(0, 20) + '...' || 'NONE');

  // Don't redirect immediately - return debug info
  if (!token) {
    console.log('No access token found in cookies');
    return {
      error: 'NO_TOKEN',
      debug: {
        allCookies: allCookies.map(c => ({ name: c.name, valueLength: c.value.length })),
        tokenFound: false
      }
    };
  }

  try {
    // First try with the isomorphic client's automatic token handling
    console.log('Making API call with isomorphic client auto-auth');
    const data = await apiClientIsomorphic.get('/users/me?populate=*');
    console.log('API Response success with auto-auth:', !!data);
    return data;
  } catch (error: any) {
    console.error('=== Auto-auth failed, trying manual auth ===');
    
    try {
      // Try with explicit auth header
      console.log('Making API call with explicit token:', token.value.substring(0, 20) + '...');
      const config = apiClientIsomorphic.withAuthHeader(token.value);
      console.log('Request config:', { headers: config.headers });
      
      const data = await apiClientIsomorphic.get('/users/me?populate=*', config);
      console.log('API Response success with manual auth:', !!data);
      return data;
    } catch (error2: any) {
      console.error('=== Both API attempts failed ===');
      console.error('Error message:', error2.message);
      console.error('Error status:', error2.status);
      console.error('Error code:', error2.code);
      console.error('Error details:', error2.details);
      console.error('Full error:', JSON.stringify(error2, null, 2));
      
      // Check if it's actually a Strapi response
      if (error2.response?.data) {
        console.error('Strapi response:', error2.response.data);
      }
      
      return {
        error: 'API_ERROR',
        debug: {
          message: error2.message,
          status: error2.status,
          code: error2.code,
          details: error2.details,
          token: token.value.substring(0, 20) + '...',
          strapiResponse: error2.response?.data
        }
      };
    }
  }
}

export default async function ProfilePage() {
  const userData = await getUser();

  // If there's an error, show debug page
  if (userData?.error) {
    return (
      <div className="container max-w-4xl py-6 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
          Profile Debug Information
        </h1>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Error: {userData.error}</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(userData.debug, null, 2)}
          </pre>
        </div>
        <div className="mt-4">
          <a href="/auth/login" className="text-blue-500 underline">
            Go to login page
          </a>
        </div>
      </div>
    );
  }

  return <ProfileClient initialUser={userData} />;
}
