import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api-client';
import { ApiResponse } from '@app/shared-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to Express backend
    const data = await apiClient.post<ApiResponse>('/auth/verify-email', body);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Email verification request error:', error);
    
    const err = error as { message?: string; status?: number; code?: string; response?: any };
    
    // Handle axios errors properly
    if (err.response) {
      return NextResponse.json(
        err.response.data || { error: { message: 'Failed to send verification email' } },
        { status: err.response.status || 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: { 
          message: err.message || 'Failed to send verification email',
          code: err.code 
        } 
      },
      { status: err.status || 500 }
    );
  }
}