import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';
import { apiClient } from '@/lib/api-client';
import { serverApiGet } from '@/lib/server-api';

// Force dynamic rendering since we're using cookies
export const dynamic = 'force-dynamic';

async function getUser() {
  const result = await serverApiGet('/users/me?populate=*');
  
  if (!result.success) {
    // If not authenticated, redirect to login
    if (result.error?.includes('Not authenticated')) {
      redirect('/auth/login');
    }
    
    // For other errors, return null or handle as needed
    console.error('Failed to get user:', result.error);
    return null;
  }
  
  return result.data;
}

export default async function ProfilePage() {
  const userData = await getUser();

  // If no user data, redirect to login (this is a fallback, normally handled in getUser)
  if (!userData) {
    redirect('/auth/login');
  }

  return <ProfileClient initialUser={userData} />;
}
