import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../services/product/productService';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';
import {
  IProductCreate,
  IProductUpdate,
  ProductSearchParams,
  UserRole,
} from '@app/shared-types';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    status: string;
    partnerId?: string;
  };
}

const productService = new ProductService(prisma);

export const productController = {
  // Create a new product (supports both simple and detailed creation)
  async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        name,
        description,
        sku,
        categoryId,
        status = 'ACTIVE',
        pricing,
        commissions,
        imageUrl,
        inStock,
      } = req.body;

      // Check if this is a detailed product creation (with pricing/commissions)
      if (pricing || commissions) {
        // Detailed product creation with pricing and commission structure
        if (!name || !sku || !pricing || !commissions) {
          throw new AppError(
            'Missing required fields for detailed product creation',
            400
          );
        }

        const result = await prisma.$transaction(async (tx) => {
          // Create product
          const product = await tx.product.create({
            data: {
              name,
              description,
              sku,
              categoryId: categoryId ? parseInt(categoryId) : null,
              status,
              imageUrl,
              inStock: inStock ?? true,
            },
          });

          // Create pricing
          const productPricing = await tx.productPricing.create({
            data: {
              productId: product.id,
              pvValue: pricing.pvValue,
              customerPrice: pricing.customerPrice,
              travelPackagePrice: pricing.travelPackagePrice || null,
              costPrice: pricing.costPrice,
            },
          });

          // Create commission structure
          const productCommission = await tx.productCommissionTier.create({
            data: {
              productId: product.id,
              productName: name,
              salesCommissionAmount: commissions.salesCommissionAmount,
              leaderCommissionAmount: commissions.leaderCommissionAmount,
              managerCommissionAmount: commissions.managerCommissionAmount,
              salesCommissionRate: commissions.salesCommissionRate || 0.3,
              leaderCommissionRate: commissions.leaderCommissionRate || 0.1,
              managerCommissionRate: commissions.managerCommissionRate || 0.05,
            },
          });

          return { product, productPricing, productCommission };
        });

        res.status(201).json({
          success: true,
          message: 'Product created successfully',
          data: result,
        });
      } else {
        // Simple product creation using existing service
        const productData: IProductCreate = req.body;
        const product = await productService.createProduct(productData);
        res.status(201).json({
          success: true,
          data: product,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Update product (supports both simple and detailed updates)
  async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        sku,
        categoryId,
        status,
        pricing,
        commissions,
        imageUrl,
        inStock,
      } = req.body;

      const productId = parseInt(id);

      // Check if this is a detailed product update (with pricing/commissions)
      if (pricing || commissions) {
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!existingProduct) {
          throw new AppError('Product not found', 404);
        }

        const result = await prisma.$transaction(async (tx) => {
          // Update product
          const product = await tx.product.update({
            where: { id: productId },
            data: {
              ...(name && { name }),
              ...(description !== undefined && { description }),
              ...(sku && { sku }),
              ...(categoryId !== undefined && {
                categoryId: categoryId ? parseInt(categoryId) : null,
              }),
              ...(status && { status }),
              ...(imageUrl !== undefined && { imageUrl }),
              ...(inStock !== undefined && { inStock }),
            },
          });

          // Update pricing if provided
          let productPricing = null;
          if (pricing) {
            productPricing = await tx.productPricing.upsert({
              where: { productId },
              update: {
                ...(pricing.pvValue !== undefined && {
                  pvValue: pricing.pvValue,
                }),
                ...(pricing.customerPrice !== undefined && {
                  customerPrice: pricing.customerPrice,
                }),
                ...(pricing.travelPackagePrice !== undefined && {
                  travelPackagePrice: pricing.travelPackagePrice,
                }),
                ...(pricing.costPrice !== undefined && {
                  costPrice: pricing.costPrice,
                }),
              },
              create: {
                productId,
                pvValue: pricing.pvValue || 0,
                customerPrice: pricing.customerPrice || 0,
                travelPackagePrice: pricing.travelPackagePrice || null,
                costPrice: pricing.costPrice || 0,
              },
            });
          }

          // Update commission structure if provided
          let productCommission = null;
          if (commissions) {
            productCommission = await tx.productCommissionTier.upsert({
              where: { productId },
              update: {
                ...(name && { productName: name }),
                ...(commissions.salesCommissionAmount !== undefined && {
                  salesCommissionAmount: commissions.salesCommissionAmount,
                }),
                ...(commissions.leaderCommissionAmount !== undefined && {
                  leaderCommissionAmount: commissions.leaderCommissionAmount,
                }),
                ...(commissions.managerCommissionAmount !== undefined && {
                  managerCommissionAmount: commissions.managerCommissionAmount,
                }),
                ...(commissions.salesCommissionRate !== undefined && {
                  salesCommissionRate: commissions.salesCommissionRate,
                }),
                ...(commissions.leaderCommissionRate !== undefined && {
                  leaderCommissionRate: commissions.leaderCommissionRate,
                }),
                ...(commissions.managerCommissionRate !== undefined && {
                  managerCommissionRate: commissions.managerCommissionRate,
                }),
              },
              create: {
                productId,
                productName: name || existingProduct.name,
                salesCommissionAmount: commissions.salesCommissionAmount || 0,
                leaderCommissionAmount: commissions.leaderCommissionAmount || 0,
                managerCommissionAmount:
                  commissions.managerCommissionAmount || 0,
                salesCommissionRate: commissions.salesCommissionRate || 0.3,
                leaderCommissionRate: commissions.leaderCommissionRate || 0.1,
                managerCommissionRate:
                  commissions.managerCommissionRate || 0.05,
              },
            });
          }

          return { product, productPricing, productCommission };
        });

        res.json({
          success: true,
          message: 'Product updated successfully',
          data: result,
        });
      } else {
        // Simple product update using existing service
        const updateData: IProductUpdate = req.body;
        const product = await productService.updateProduct(
          Number(id),
          updateData
        );
        res.json({
          success: true,
          data: product,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Get product by ID (returns detailed data for admin users)
  async getProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const isAdmin =
        req.user && ['SUPER_ADMIN', 'MANAGER'].includes(req.user.role);

      if (isAdmin) {
        // Return detailed product data for admin users
        const product = await prisma.product.findUnique({
          where: { id: parseInt(id) },
          include: {
            productPricing: true,
            productCommissions: true,
            category: true,
          },
        });

        if (!product) {
          throw new AppError('Product not found', 404);
        }

        res.json({
          success: true,
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            status: product.status,
            category: product.category,
            pricing: product.productPricing,
            commissions: Array.isArray(product.productCommissions)
              ? product.productCommissions[0] || null
              : product.productCommissions || null,
            imageUrl: product.imageUrl,
            inStock: product.inStock,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
          },
        });
      } else {
        // Return simple product data for public users
        const product = await productService.getProduct(Number(id));

        if (!product) {
          throw new AppError('Product not found', 404);
        }

        res.json({
          success: true,
          data: product,
        });
      }
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
        inStock:
          req.query.inStock !== undefined
            ? req.query.inStock === 'true'
            : undefined,
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
        message: 'Product deleted successfully',
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

  // Get commission calculation preview
  async getCommissionPreview(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { productId, quantity = 1 } = req.query;

      if (!productId) {
        throw new AppError('Product ID is required', 400);
      }

      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId as string) },
        include: {
          productPricing: true,
          productCommissions: true,
        },
      });

      if (!product || !product.productPricing) {
        throw new AppError('Product or pricing not found', 404);
      }

      const commissions = Array.isArray(product.productCommissions)
        ? product.productCommissions
        : product.productCommissions
          ? [product.productCommissions]
          : [];

      if (!commissions[0]) {
        throw new AppError('Product or commission structure not found', 404);
      }

      const qty = parseInt(quantity as string);
      const pricing = product.productPricing;
      const commission = commissions[0];

      const preview = {
        product: {
          id: product.id,
          name: product.name,
          customerPrice: pricing.customerPrice,
          pvValue: pricing.pvValue,
        },
        quantity: qty,
        totalPrice: pricing.customerPrice * qty,
        totalPvPoints: pricing.pvValue * qty,
        commissions: {
          sales: {
            amount: commission.salesCommissionAmount * qty,
            rate: commission.salesCommissionRate,
          },
          leader: {
            amount: commission.leaderCommissionAmount * qty,
            rate: commission.leaderCommissionRate,
          },
          manager: {
            amount: commission.managerCommissionAmount * qty,
            rate: commission.managerCommissionRate,
          },
        },
        totalCommissionPayout:
          (commission.salesCommissionAmount +
            commission.leaderCommissionAmount +
            commission.managerCommissionAmount) *
          qty,
      };

      res.json({
        success: true,
        data: preview,
      });
    } catch (error) {
      next(error);
    }
  },
};
