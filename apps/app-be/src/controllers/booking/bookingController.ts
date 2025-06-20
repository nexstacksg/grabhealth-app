import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth/authenticate';
import { ApiResponse, IBookingFilter, BookingStatus } from '@app/shared-types';
import { BookingService } from '../../services/booking/bookingService';

class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }
  async createBooking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const bookingData = {
        ...req.body,
        userId,
      };

      const booking = await this.bookingService.createBooking(bookingData);

      const response: ApiResponse = {
        success: true,
        data: booking,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Create booking error:', error);

      if (
        error.message === 'Service not found' ||
        error.message === 'Partner not found'
      ) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      if (
        error.message === 'Time slot not available' ||
        error.message?.includes('slot')
      ) {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'The selected time slot is no longer available',
          },
        });
        return;
      }

      if (
        error.message?.includes('full') ||
        error.message?.includes('booked')
      ) {
        res.status(409).json({
          success: false,
          error: {
            code: 'SLOT_FULL',
            message: 'This slot is fully booked',
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create booking',
        },
      });
    }
  }

  async getBookings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters: IBookingFilter = {
        userId: userId || '',
        status: req.query.status as BookingStatus | undefined,
        fromDate: req.query.fromDate
          ? new Date(req.query.fromDate as string)
          : undefined,
        toDate: req.query.toDate
          ? new Date(req.query.toDate as string)
          : undefined,
      };

      const result = await this.bookingService.getBookings(
        filters as any,
        page,
        limit
      );

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch bookings',
        },
      });
    }
  }

  async getBooking(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const booking = await this.bookingService.getBooking(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found',
          },
        });
        return;
      }

      // Check if user owns this booking
      if (booking.userId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: booking,
      };

      res.json(response);
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch booking',
        },
      });
    }
  }

  async updateBookingStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, cancellationReason } = req.body;
      const userId = req.user!.id;

      const booking = await this.bookingService.getBooking(id);

      if (!booking) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found',
          },
        });
        return;
      }

      // Check if user owns this booking
      if (booking.userId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      const updatedBooking = await this.bookingService.updateBookingStatus(
        id,
        status,
        cancellationReason
      );

      const response: ApiResponse = {
        success: true,
        data: updatedBooking,
      };

      res.json(response);
    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update booking status',
        },
      });
    }
  }
}

export const bookingController = new BookingController();
