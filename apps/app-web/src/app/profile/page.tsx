import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from './profile-client';
import { api } from '@/services/api.service';

async function getUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken');
  
  if (!token) {
    redirect('/auth/login');
  }

  try {
    // Server-side API call with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/users/me?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 401) {
        redirect('/auth/login');
      }
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
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