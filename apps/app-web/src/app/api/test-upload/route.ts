import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    
    // Log what we're sending
    console.log('=== UPLOAD TEST ===');
    console.log('Auth token present:', !!token.value);
    console.log('FormData keys:', Array.from(formData.keys()));
    
    // Upload to Strapi
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    const uploadUrl = `${baseUrl}/api/upload`;
    
    console.log('Uploading to:', uploadUrl);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
      body: formData,
    });

    const responseText = await uploadResponse.text();
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response:', responseText);

    let uploadData;
    try {
      uploadData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return NextResponse.json({ 
        error: 'Invalid response from upload', 
        responseText,
        status: uploadResponse.status 
      }, { status: 500 });
    }

    if (!uploadResponse.ok) {
      return NextResponse.json({ 
        error: uploadData?.error?.message || 'Upload failed',
        details: uploadData,
        status: uploadResponse.status
      }, { status: uploadResponse.status });
    }

    // Return the upload result
    return NextResponse.json({
      success: true,
      uploadedFile: uploadData[0],
      allFiles: uploadData,
      rawResponse: responseText
    });

  } catch (error: any) {
    console.error('Test upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Upload test failed',
      stack: error.stack
    }, { status: 500 });
  }
}