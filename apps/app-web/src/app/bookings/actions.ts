'use server';

import { cookies } from 'next/headers';

interface CreateBookingData {
  partnerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

export async function createBookingAction(data: CreateBookingData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    console.log('Creating booking with server action:', data);
    
    // Make direct API call with token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/api/partners/${data.partnerId}/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceId: data.serviceId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        notes: data.notes || '',
        isFreeCheckup: data.isFreeCheckup || false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Booking API error:', errorData);
      return { 
        success: false, 
        error: errorData?.error?.message || `Error ${response.status}: ${response.statusText}`,
        details: errorData
      };
    }
    
    const bookingData = await response.json();
    console.log('Booking created successfully:', bookingData);
    
    return { success: true, booking: bookingData };
  } catch (error: any) {
    console.error('Failed to create booking:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create booking',
      details: error
    };
  }
}