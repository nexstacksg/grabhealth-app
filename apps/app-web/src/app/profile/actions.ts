'use server';

import { revalidatePath } from 'next/cache';
import { serverApiPut, serverApiPost } from '@/lib/server-api';

export async function updateProfileAction(data: {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
}) {
  // Use custom-auth update-profile endpoint for authenticated users
  const result = await serverApiPut('/custom-auth/update-profile', {
    username: data.username,
    email: data.email,
    phoneNumber: data.phoneNumber,
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
    // Get auth token from cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    
    if (!token) {
      return { error: 'Not authenticated' };
    }

    // Create FormData for upload
    const uploadFormData = new FormData();
    uploadFormData.append('files', file);

    // Upload the file to Strapi
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      console.error('Upload failed:', uploadResponse.status, errorData);
      return { error: errorData?.error?.message || 'Failed to upload image' };
    }

    const uploadedFiles = await uploadResponse.json();
    console.log('Upload response:', uploadedFiles);
    
    const uploadedFile = uploadedFiles[0];
    
    if (!uploadedFile || !uploadedFile.id) {
      console.error('No file in upload response:', uploadedFiles);
      return { error: 'No file uploaded' };
    }

    console.log('Updating user profile with image ID:', uploadedFile.id, 'for user:', userId);
    console.log('Full upload response:', uploadedFile);

    // Update the user's profile image using custom-auth update-profile endpoint
    // This endpoint allows users to update their own profile
    console.log('Attempting to update profile with:', {
      endpoint: '/custom-auth/update-profile',
      profileImageId: uploadedFile.id,
      profileImageType: typeof uploadedFile.id
    });
    
    const updateResult = await serverApiPut('/custom-auth/update-profile', {
      profileImage: uploadedFile.id,
    });

    console.log('Update result:', updateResult);

    if (!updateResult.success) {
      console.error('Update failed:', updateResult);
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