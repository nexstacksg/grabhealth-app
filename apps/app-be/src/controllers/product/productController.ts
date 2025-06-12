import { Request, Response, NextFunction } from "express";
import { ProductService } from "../../services/product.service";
import prisma from "../../database/client";
import { AppError } from "../../middleware/error/errorHandler";
import {
  IProductCreate,
  IProductUpdate,
  ProductSearchParams,
} from "@app/shared-types";

const productService = new ProductService(prisma);

export const productController = {
  // Create a new product
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productData: IProductCreate = req.body;
      const product = await productService.createProduct(productData);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update product
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: IProductUpdate = req.body;
      const product = await productService.updateProduct(
        Number(id),
        updateData
      );
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get product by ID
  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProduct(Number(id));

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  // Search products
  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ProductSearchParams = {
        query: req.query.query as string,
        category: req.query.category as string,
        categoryId: req.query.categoryId
          ? Number(req.query.categoryId)
          : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        inStock: req.query.inStock === "true",
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await productService.searchProducts(params);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete product
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(Number(id));
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all categories
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get products by category
  async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(
        Number(categoryId)
      );
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get featured products
  async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 8;
      const products = await productService.getFeaturedProducts(limit);
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update product stock
  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { inStock } = req.body;
      const product = await productService.updateStock(Number(id), inStock);
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
};
