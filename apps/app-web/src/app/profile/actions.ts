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

    const uploadedFile = uploadedFiles[0];
    if (!uploadedFile || !uploadedFile.id) {
      return { error: 'No file uploaded' };
    }

    // Update the user's profile image with the media ID
    const updateResult = await serverApiPut(`/users/${userId}`, {
      profileImage: uploadedFile.id,
    });

    if (!updateResult.success) {
      return { error: updateResult.error || 'Failed to update profile image' };
    }

    revalidatePath('/profile');
    return { success: true, imageUrl: uploadedFile.url };
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
  const result = await serverApiPost('/custom-auth/change-password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });

  if (result.success) {
    return { success: true };
  }

  return { error: result.error || 'Failed to change password' };
}