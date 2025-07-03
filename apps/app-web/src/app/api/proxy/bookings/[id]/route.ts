import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

/**
 * Proxy API route for booking operations to avoid CORS issues
 * This handles various HTTP methods to /api/proxy/bookings/:id
 */
async function handleRequest(
  request: NextRequest,
  params: { id: string },
  method: string
) {
  try {
    const bookingId = params.id;
    const requestData = await request.json();

    // Get auth token from request cookies
    let accessToken = '';
    const cookieHeader = request.headers.get('cookie');

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.startsWith('accessToken=')
      );
      if (accessTokenCookie) {
        accessToken = accessTokenCookie.split('=')[1];
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(
      `Proxying ${method} request to ${API_BASE_URL}/api/bookings/${bookingId}`
    );

    // Use Strapi's standard API structure
    // For updating a booking, we use PUT /api/bookings/:id
    console.log('Request body:', JSON.stringify(requestData, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from API: ${response.status}`, errorText);
      return NextResponse.json(
        {
          message: `API Error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    // Get the response data
    const responseData = await response.json();

    // Return the same status code and data
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error('Proxy API error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export handlers for different HTTP methods
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleRequest(request, params, 'PUT');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleRequest(request, params, 'POST');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleRequest(request, params, 'PATCH');
}
