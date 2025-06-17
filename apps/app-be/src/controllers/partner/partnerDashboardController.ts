import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth/authenticate';
import { partnerDashboardService } from '../../services/partner/partnerDashboardService';
import { getPartnerId } from '../../middleware/auth/partnerAuth';
import { ApiResponse } from '@app/shared-types';

class PartnerDashboardController {
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const stats = await partnerDashboardService.getDashboardStats(partnerId);

      const response: ApiResponse = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch dashboard statistics'
        }
      });
    }
  }

  async getPartnerBookings(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const filters = {
        partnerId,
        status: req.query.status as string,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
        serviceId: req.query.serviceId as string
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await partnerDashboardService.getPartnerBookings(filters, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner bookings error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch bookings'
        }
      });
    }
  }

  async getTodaySchedule(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const schedule = await partnerDashboardService.getTodaySchedule(partnerId);

      const response: ApiResponse = {
        success: true,
        data: schedule
      };

      res.json(response);
    } catch (error) {
      console.error('Get today schedule error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch today\'s schedule'
        }
      });
    }
  }

  async updateBookingStatus(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const booking = await partnerDashboardService.updateBookingStatus(id, partnerId, status, notes);

      const response: ApiResponse = {
        success: true,
        data: booking
      };

      res.json(response);
    } catch (error: any) {
      console.error('Update booking status error:', error);
      
      if (error.message === 'Booking not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found'
          }
        });
        return;
      }

      if (error.message.includes('Invalid status transition')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: error.message
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update booking status'
        }
      });
    }
  }

  async getPartnerServices(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const services = await partnerDashboardService.getPartnerServices(partnerId);

      const response: ApiResponse = {
        success: true,
        data: services
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner services error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch services'
        }
      });
    }
  }

  async createPartnerService(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const service = await partnerDashboardService.createPartnerService(partnerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: service
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create partner service error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create service'
        }
      });
    }
  }

  async updatePartnerService(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      const { id } = req.params;
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const service = await partnerDashboardService.updatePartnerService(id, partnerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: service
      };

      res.json(response);
    } catch (error: any) {
      console.error('Update partner service error:', error);
      
      if (error.message === 'Service not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Service not found'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update service'
        }
      });
    }
  }

  async deletePartnerService(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      const { id } = req.params;
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      await partnerDashboardService.deletePartnerService(id, partnerId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Service deleted successfully' }
      };

      res.json(response);
    } catch (error: any) {
      console.error('Delete partner service error:', error);
      
      if (error.message === 'Service not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Service not found'
          }
        });
        return;
      }

      if (error.message === 'Cannot delete service with active bookings') {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Cannot delete service with active bookings'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete service'
        }
      });
    }
  }

  async getPartnerAvailability(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const availability = await partnerDashboardService.getPartnerAvailability(partnerId);

      const response: ApiResponse = {
        success: true,
        data: availability
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner availability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch availability'
        }
      });
    }
  }

  async updatePartnerAvailability(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const result = await partnerDashboardService.updatePartnerAvailability(partnerId, req.body.availability);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      res.json(response);
    } catch (error) {
      console.error('Update partner availability error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update availability'
        }
      });
    }
  }

  async getPartnerProfile(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const profile = await partnerDashboardService.getPartnerProfile(partnerId);

      const response: ApiResponse = {
        success: true,
        data: profile
      };

      res.json(response);
    } catch (error: any) {
      console.error('Get partner profile error:', error);
      
      if (error.message === 'Partner not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Partner not found'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partner profile'
        }
      });
    }
  }

  async updatePartnerProfile(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const profile = await partnerDashboardService.updatePartnerProfile(partnerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: profile
      };

      res.json(response);
    } catch (error) {
      console.error('Update partner profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update partner profile'
        }
      });
    }
  }

  async getPartnerDaysOff(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const daysOff = await partnerDashboardService.getPartnerDaysOff(partnerId);

      const response: ApiResponse = {
        success: true,
        data: daysOff
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner days off error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch days off'
        }
      });
    }
  }

  async createPartnerDayOff(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      const dayOff = await partnerDashboardService.createPartnerDayOff(partnerId, req.body);

      const response: ApiResponse = {
        success: true,
        data: dayOff
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Create partner day off error:', error);
      
      if (error.message === 'Day off already exists for this date') {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Day off already exists for this date'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create day off'
        }
      });
    }
  }

  async deletePartnerDayOff(req: AuthRequest, res: Response) {
    try {
      const partnerId = getPartnerId(req);
      const { id } = req.params;
      
      if (!partnerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Partner ID not found'
          }
        });
        return;
      }

      await partnerDashboardService.deletePartnerDayOff(id, partnerId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Day off deleted successfully' }
      };

      res.json(response);
    } catch (error: any) {
      console.error('Delete partner day off error:', error);
      
      if (error.message === 'Day off not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Day off not found'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete day off'
        }
      });
    }
  }
}

export const partnerDashboardController = new PartnerDashboardController();