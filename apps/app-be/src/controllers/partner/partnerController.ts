import { Request, Response } from 'express';
import { partnerService } from '../../services/partner/partnerService';
import { ApiResponse } from '@app/shared-types';

class PartnerController {
  async getPartners(req: Request, res: Response) {
    try {
      const filters = {
        city: req.query.city as string,
        specialization: req.query.specialization as string,
        rating: req.query.rating
          ? parseFloat(req.query.rating as string)
          : undefined,
        search: req.query.search as string,
        isActive: req.query.isActive !== 'false',
      };

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await partnerService.getPartners(filters, page, limit);

      const response: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      console.error('Get partners error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partners',
        },
      });
    }
  }

  async getPartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const partner = await partnerService.getPartnerById(id);

      if (!partner) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Partner not found',
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: partner,
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partner',
        },
      });
    }
  }

  async getPartnerServices(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const filters = {
        category: req.query.category as string,
        isActive: req.query.isActive !== 'false',
      };

      const services = await partnerService.getPartnerServices(id, filters);

      const response: ApiResponse = {
        success: true,
        data: services,
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner services error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partner services',
        },
      });
    }
  }

  async getPartnerCalendar(req: Request, res: Response) {
    try {
      const { id, month } = req.params;
      const [year, monthNum] = month.split('-').map(Number);

      const calendar = await partnerService.getPartnerCalendar(
        id,
        year,
        monthNum
      );

      const response: ApiResponse = {
        success: true,
        data: calendar,
      };

      res.json(response);
    } catch (error) {
      console.error('Get partner calendar error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch partner calendar',
        },
      });
    }
  }

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { id, date } = req.params;

      // Check if detailed breakdown is requested
      const detailed = req.query.detailed === 'true';

      if (detailed) {
        const slotBreakdown = await partnerService.getDetailedSlotBreakdown(
          id,
          new Date(date)
        );
        const response: ApiResponse = {
          success: true,
          data: slotBreakdown,
        };
        res.json(response);
      } else {
        const slots = await partnerService.getAvailableSlots(
          id,
          new Date(date)
        );
        const response: ApiResponse = {
          success: true,
          data: slots,
        };
        res.json(response);
      }
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch available slots',
        },
      });
    }
  }
}

export const partnerController = new PartnerController();
