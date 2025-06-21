import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { AppError } from '../../middleware/error/errorHandler';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const productManagementController = {
  // Get all products with pricing and commission data
  async getAllProducts(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        include: {
          productPricing: true,
          productCommissions: true,
          category: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json({
        success: true,
        data: products.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          status: product.status,
          category: product.category,
          pricing: product.productPricing,
          commissions: product.productCommissions[0] || null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single product by ID
  async getProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
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
          commissions: product.productCommissions[0] || null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new product with pricing and commission structure
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
      } = req.body;

      // Validate required fields
      if (!name || !sku || !pricing || !commissions) {
        throw new AppError('Missing required fields', 400);
      }

      const result = await prisma.$transaction(async (tx: any) => {
        // Create product
        const product = await tx.product.create({
          data: {
            name,
            description,
            sku,
            categoryId: categoryId ? parseInt(categoryId) : null,
            status,
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
            salesCommissionRate: commissions.salesCommissionRate || 0.30,
            leaderCommissionRate: commissions.leaderCommissionRate || 0.10,
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
    } catch (error) {
      next(error);
    }
  },

  // Update product with pricing and commission structure
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
      } = req.body;

      const productId = parseInt(id);

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new AppError('Product not found', 404);
      }

      const result = await prisma.$transaction(async (tx: any) => {
        // Update product
        const product = await tx.product.update({
          where: { id: productId },
          data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(sku && { sku }),
            ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
            ...(status && { status }),
          },
        });

        // Update pricing if provided
        let productPricing = null;
        if (pricing) {
          productPricing = await tx.productPricing.upsert({
            where: { productId },
            update: {
              ...(pricing.pvValue !== undefined && { pvValue: pricing.pvValue }),
              ...(pricing.customerPrice !== undefined && { customerPrice: pricing.customerPrice }),
              ...(pricing.travelPackagePrice !== undefined && { travelPackagePrice: pricing.travelPackagePrice }),
              ...(pricing.costPrice !== undefined && { costPrice: pricing.costPrice }),
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
              ...(commissions.salesCommissionAmount !== undefined && { salesCommissionAmount: commissions.salesCommissionAmount }),
              ...(commissions.leaderCommissionAmount !== undefined && { leaderCommissionAmount: commissions.leaderCommissionAmount }),
              ...(commissions.managerCommissionAmount !== undefined && { managerCommissionAmount: commissions.managerCommissionAmount }),
              ...(commissions.salesCommissionRate !== undefined && { salesCommissionRate: commissions.salesCommissionRate }),
              ...(commissions.leaderCommissionRate !== undefined && { leaderCommissionRate: commissions.leaderCommissionRate }),
              ...(commissions.managerCommissionRate !== undefined && { managerCommissionRate: commissions.managerCommissionRate }),
            },
            create: {
              productId,
              productName: name || existingProduct.name,
              salesCommissionAmount: commissions.salesCommissionAmount || 0,
              leaderCommissionAmount: commissions.leaderCommissionAmount || 0,
              managerCommissionAmount: commissions.managerCommissionAmount || 0,
              salesCommissionRate: commissions.salesCommissionRate || 0.30,
              leaderCommissionRate: commissions.leaderCommissionRate || 0.10,
              managerCommissionRate: commissions.managerCommissionRate || 0.05,
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
    } catch (error) {
      next(error);
    }
  },

  // Delete product
  async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const productId = parseInt(id);

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new AppError('Product not found', 404);
      }

      // Delete product (cascade will handle related records)
      await prisma.product.delete({
        where: { id: productId },
      });

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Get commission calculation preview
  async getCommissionPreview(req: AuthRequest, res: Response, next: NextFunction) {
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

      if (!product || !product.productPricing || !product.productCommissions[0]) {
        throw new AppError('Product or commission structure not found', 404);
      }

      const qty = parseInt(quantity as string);
      const pricing = product.productPricing;
      const commission = product.productCommissions[0];

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
        totalCommissionPayout: (
          commission.salesCommissionAmount +
          commission.leaderCommissionAmount +
          commission.managerCommissionAmount
        ) * qty,
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
