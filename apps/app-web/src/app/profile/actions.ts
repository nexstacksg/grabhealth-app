'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export async function updateProfileAction(data: {
  userId: string;
  username: string;
  email: string;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken');

  if (!token) {
    return { error: 'Unauthorized' };
  }

  try {
    const response = await fetch(`${API_URL}/api/users/${data.userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        firstName: data.username, // Use username as firstName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error?.message || 'Failed to update profile' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function uploadProfileImageAction(formData: FormData) {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken');

  if (!token) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return { error: 'Missing file or user ID' };
  }

  try {
    // First, upload the file to Strapi
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      return { error: 'Failed to upload image' };
    }

    const uploadedFiles = await uploadResponse.json();
    const imageUrl = uploadedFiles[0]?.url;

    if (!imageUrl) {
      return { error: 'No image URL returned' };
    }

    // Then, update the user's profile image
    const updateResponse = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileImage: imageUrl,
      }),
    });

    if (!updateResponse.ok) {
      return { error: 'Failed to update profile image' };
    }

    revalidatePath('/profile');
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Image upload error:', error);
    return { error: 'Failed to upload image' };
  }
}

export async function changePasswordAction(data: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  // Note: Strapi doesn't have a built-in change password endpoint for authenticated users
  // This would need to be implemented as a custom endpoint in Strapi
  return { error: 'Password change functionality is not yet implemented with Strapi backend. Please use the forgot password flow instead.' };
}