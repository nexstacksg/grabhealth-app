'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';
import { serverApiPut, serverApiPost } from '@/lib/server-api';

export async function updateProfileAction(data: {
  userId: string;
  username: string;
  email: string;
}) {
  const result = await serverApiPut(`/users/${data.userId}`, {
    username: data.username,
    email: data.email,
    firstName: data.username, // Use username as firstName
  });

  if (result.success) {
    revalidatePath('/profile');
    return { success: true };
  }

  return { error: result.error || 'Failed to update profile' };
}

export async function uploadProfileImageAction(formData: FormData) {
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return { error: 'Missing file or user ID' };
  }

  try {
    // Use the unified API client which handles auth automatically
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    const uploadedFiles = await apiClient.post('/upload', uploadFormData);

    const imageUrl = uploadedFiles[0]?.url;

    if (!imageUrl) {
      return { error: 'No image URL returned' };
    }

    // Update the user's profile image
    const updateResult = await serverApiPut(`/users/${userId}`, {
      profileImage: imageUrl,
    });

    if (!updateResult.success) {
      return { error: updateResult.error || 'Failed to update profile image' };
    }

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