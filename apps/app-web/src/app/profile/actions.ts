'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { apiClientIsomorphic } from '@/services/api-client-isomorphic';

export async function updateProfileAction(data: {
  userId: string;
  username: string;
  email: string;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');

  if (!token) {
    return { error: 'Unauthorized' };
  }

  try {
    await apiClientIsomorphic.put(`/users/${data.userId}`, {
      username: data.username,
      email: data.email,
      firstName: data.username, // Use username as firstName
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Profile update error:', error);
    return { error: error.message || 'Failed to update profile' };
  }
}

export async function uploadProfileImageAction(formData: FormData) {
  const cookieStore = await cookies();
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

    const uploadedFiles = await apiClientIsomorphic.post('/upload', uploadFormData, {
      headers: {
        // Let axios handle the Content-Type for FormData
      },
    });

    const imageUrl = uploadedFiles[0]?.url;

    if (!imageUrl) {
      return { error: 'No image URL returned' };
    }

    // Then, update the user's profile image
    await apiClientIsomorphic.put(`/users/${userId}`, {
      profileImage: imageUrl,
    });

    revalidatePath('/profile');
    return { success: true, imageUrl };
  } catch (error: any) {
    console.error('Image upload error:', error);
    return { error: error.message || 'Failed to upload image' };
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