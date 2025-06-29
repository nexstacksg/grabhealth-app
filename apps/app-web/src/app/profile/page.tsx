import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');

  if (!token) {
    redirect('/auth/login');
  }

  try {
    // Server-side API call using isomorphic client
    const data = await apiClientIsomorphic.get('/users/me?populate=*');
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/auth/login');
  }
}

export default async function ProfilePage() {
  const userData = await getUser();

  return <ProfileClient initialUser={userData} />;
}
