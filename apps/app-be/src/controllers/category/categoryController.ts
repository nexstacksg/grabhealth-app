import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../../services/category/categoryService';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';
import { ICategoryCreate, ICategoryUpdate } from '@app/shared-types';

const categoryService = new CategoryService(prisma);

export const categoryController = {
  // Create a new category
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryData: ICategoryCreate = req.body;
      const category = await categoryService.createCategory(categoryData);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update category
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: ICategoryUpdate = { ...req.body, id: Number(id) };
      const category = await categoryService.updateCategory(
        Number(id),
        updateData
      );
      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get category by ID
  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategory(Number(id));

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all categories
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories =
        await categoryService.getAllCategories(includeInactive);
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get category tree
  async getCategoryTree(_req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await categoryService.getCategoryTree();
      res.json({
        success: true,
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete category
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(Number(id));
      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Reorder categories
  async reorderCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryOrders } = req.body;
      await categoryService.reorderCategories(categoryOrders);
      res.json({
        success: true,
        message: 'Categories reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
