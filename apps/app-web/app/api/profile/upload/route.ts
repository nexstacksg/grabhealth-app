import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
  console.log('Starting profile picture upload...');
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    console.log('Current user:', user?.id);

    if (!user) {
      console.error('No authenticated user');
      return NextResponse.json(
        { error: 'You must be signed in to upload a profile picture' },
        { status: 401 }
      );
    }

    // Parse the form data
    console.log('Getting form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    console.log(
      'File received:',
      file
        ? {
            name: file.name,
            type: file.type,
            size: file.size,
          }
        : 'No file'
    );

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Get the current user to check for existing image
    console.log('Checking for existing profile image...');
    let currentImageUrl: string | null = null;

    try {
      const result = await query<{ image_url: string | null }>`
        SELECT image_url FROM users WHERE id = ${user.id}
      `;
      currentImageUrl = result[0]?.image_url || null;
      console.log('Current image URL:', currentImageUrl);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching current image:', errorMessage);
      // Continue without deleting old image
    }

    // If user has an existing image, delete it from Cloudinary
    if (currentImageUrl) {
      console.log('Deleting old image from Cloudinary...');
      try {
        // Extract public_id from the URL (assuming it's a Cloudinary URL)
        const url = new URL(currentImageUrl);
        const pathParts = url.pathname.split('/');
        const publicId = pathParts
          .slice(-2)
          .join('/')
          .replace(/\.[^/.]+$/, '');

        await deleteImage(publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Convert file to buffer
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    let imageUrl: string;
    try {
      const uploadResult = await uploadImage(
        buffer,
        'grabhealth/profile-pictures'
      );
      imageUrl = uploadResult.url;
      console.log('Upload successful, image URL:', imageUrl);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error uploading to Cloudinary:', errorMessage);
      throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
    }

    // Update the user's profile picture in the database
    console.log('Updating database with new image URL...');
    try {
      await query`
        UPDATE users 
        SET image_url = ${imageUrl}
        WHERE id = ${user.id}
      `;
      console.log('Database update successful');

      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';
      console.error('Error updating database:', errorMessage);
      throw new Error(`Failed to update profile: ${errorMessage}`);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in profile picture upload:', errorMessage);
    const errorResponse: { error: string; details?: string } = {
      error: 'Failed to upload profile picture',
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = errorMessage;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
