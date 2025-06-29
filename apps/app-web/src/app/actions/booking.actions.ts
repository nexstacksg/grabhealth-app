'use server';

import { serverApiPost } from '@/lib/server-api';

interface CreateBookingData {
  partnerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  notes?: string;
  isFreeCheckup?: boolean;
}

/**
 * Server action to create a new booking
 * Requires authenticated user
 */
export async function createBookingAction(data: CreateBookingData) {
  const result = await serverApiPost(
    `/partners/${data.partnerId}/book`,
    {
      serviceId: data.serviceId,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      notes: data.notes || '',
      isFreeCheckup: data.isFreeCheckup || false,
    }
  );
  
  if (result.success) {
    return { success: true, booking: result.data };
  }
  
  return { 
    success: false, 
    error: result.error || 'Failed to create booking',
    details: result.details
  };
}