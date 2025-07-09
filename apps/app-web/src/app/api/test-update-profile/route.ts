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

    const { imageId } = await request.json();
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    console.log('=== UPDATE PROFILE TEST ===');
    console.log('Image ID:', imageId);
    console.log('Auth token present:', !!token.value);

    // Try different update approaches
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
    const results = [];

    // Test 1: Update via /users/me with direct ID
    console.log('\nTest 1: PUT /users/me with profileImage: imageId');
    try {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: imageId
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);

      results.push({
        test: 'PUT /users/me with direct ID',
        status: response.status,
        success: response.ok,
        response: responseText
      });
    } catch (error: any) {
      results.push({
        test: 'PUT /users/me with direct ID',
        error: error.message
      });
    }

    // Test 2: Update via /users/me with connect array
    console.log('\nTest 2: PUT /users/me with profileImage: { connect: [imageId] }');
    try {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: {
            connect: [imageId]
          }
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);

      results.push({
        test: 'PUT /users/me with connect array',
        status: response.status,
        success: response.ok,
        response: responseText
      });
    } catch (error: any) {
      results.push({
        test: 'PUT /users/me with connect array',
        error: error.message
      });
    }

    // Test 3: Update via /users/me with set array
    console.log('\nTest 3: PUT /users/me with profileImage: { set: [imageId] }');
    try {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: {
            set: [imageId]
          }
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);

      results.push({
        test: 'PUT /users/me with set array',
        status: response.status,
        success: response.ok,
        response: responseText
      });
    } catch (error: any) {
      results.push({
        test: 'PUT /users/me with set array',
        error: error.message
      });
    }

    // Test 4: Check if /users/me endpoint exists
    console.log('\nTest 4: GET /users/me to check endpoint');
    try {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response:', responseText);

      results.push({
        test: 'GET /users/me',
        status: response.status,
        success: response.ok,
        response: responseText
      });
    } catch (error: any) {
      results.push({
        test: 'GET /users/me',
        error: error.message
      });
    }

    return NextResponse.json({
      allResults: results,
      summary: {
        totalTests: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error: any) {
    console.error('Test update error:', error);
    return NextResponse.json({ 
      error: error.message || 'Update test failed',
      stack: error.stack
    }, { status: 500 });
  }
}