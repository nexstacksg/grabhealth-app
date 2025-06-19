import { PrismaClient, Prisma } from '@prisma/client';
import {
  IProduct,
  IProductCreate,
  IProductUpdate,
  ProductSearchParams,
  ProductSearchResponse,
  ProductStatus,
} from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async createProduct(data: IProductCreate): Promise<IProduct> {
    try {
      // Validate category exists if provided
      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category || !category.isActive) {
          throw new AppError('Invalid or inactive category', 400);
        }
      }

      // Create product and pricing in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create the product first
        const product = await tx.product.create({
          data: {
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
            imageUrl: data.imageUrl,
            inStock: data.inStock ?? true,
            status: data.status ?? ProductStatus.ACTIVE,
          },
        });

        // Create the pricing record
        await tx.productPricing.create({
          data: {
            productId: product.id,
            customerPrice: data.price || 0,
            costPrice: data.price ? data.price * 0.7 : 0, // Default cost price (70% of customer price)
            pvValue: data.price ? Math.floor(data.price * 0.1) : 0, // Default PV (10% of price)
          },
        });

        // Return product with all relations
        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            category: true,
            productPricing: true,
            productCommissions: true,
          },
        });
      });

      if (!result) {
        throw new AppError('Failed to create product', 500);
      }

      // Transform product to include price from ProductPricing
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.productPricing?.customerPrice || 0,
        categoryId: result.categoryId,
        category: result.category,
        imageUrl: result.imageUrl,
        inStock: result.inStock,
        status: result.status as ProductStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } as IProduct;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to create product', 500);
    }
  }

  async updateProduct(id: number, data: IProductUpdate): Promise<IProduct> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          productPricing: true,
        },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      // Validate category if updating
      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category || !category.isActive) {
          throw new AppError('Invalid or inactive category', 400);
        }
      }

      // Update product and pricing in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Update the product
        await tx.product.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && {
              description: data.description,
            }),
            ...(data.categoryId !== undefined && {
              categoryId: data.categoryId,
            }),
            ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
            ...(data.inStock !== undefined && { inStock: data.inStock }),
            ...(data.status && { status: data.status }),
          },
        });

        // Update pricing if price is provided
        if (data.price !== undefined) {
          if (product.productPricing) {
            // Update existing pricing
            await tx.productPricing.update({
              where: { productId: id },
              data: {
                customerPrice: data.price,
                costPrice: data.price * 0.7, // Update cost price (70% of customer price)
                pvValue: Math.floor(data.price * 0.1), // Update PV (10% of price)
              },
            });
          } else {
            // Create new pricing record
            await tx.productPricing.create({
              data: {
                productId: id,
                customerPrice: data.price,
                costPrice: data.price * 0.7,
                pvValue: Math.floor(data.price * 0.1),
              },
            });
          }
        }

        // Return updated product with all relations
        return await tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            productPricing: true,
            productCommissions: true,
          },
        });
      });

      if (!result) {
        throw new AppError('Failed to update product', 500);
      }

      // Transform product to include price from ProductPricing
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.productPricing?.customerPrice || 0,
        categoryId: result.categoryId,
        category: result.category,
        imageUrl: result.imageUrl,
        inStock: result.inStock,
        status: result.status as ProductStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } as IProduct;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to update product', 500);
    }
  }

  async getProduct(id: number): Promise<IProduct | null> {
    try {
      const result = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          productPricing: true,
          productCommissions: true,
        },
      });

      if (!result) return null;

      // Transform product to include price from ProductPricing
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.productPricing?.customerPrice || 0,
        categoryId: result.categoryId,
        category: result.category,
        imageUrl: result.imageUrl,
        inStock: result.inStock,
        status: result.status as ProductStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } as IProduct;
    } catch (_error) {
      throw new AppError('Failed to get product', 500);
    }
  }

  async searchProducts(
    params: ProductSearchParams
  ): Promise<ProductSearchResponse> {
    try {
      const {
        query,
        category,
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        sortBy = 'created',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = params;

      const where: Prisma.ProductWhereInput = {
        ...(query && {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }),
        ...(category && {
          category: {
            slug: category,
          },
        }),
        ...(categoryId && { categoryId }),
        // Price filtering now uses ProductPricing relation
        ...((minPrice !== undefined || maxPrice !== undefined) && {
          productPricing: {
            customerPrice: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          },
        }),
        ...(inStock !== undefined && { inStock }),
        status: ProductStatus.ACTIVE,
      };

      const orderBy: Prisma.ProductOrderByWithRelationInput = {};
      if (sortBy === 'price') {
        orderBy.productPricing = { customerPrice: sortOrder };
      } else if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            category: true,
            productPricing: true,
            productCommissions: true,
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      // Transform products to include price from ProductPricing
      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.productPricing?.customerPrice || 0,
        categoryId: product.categoryId,
        category: product.category,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        status: product.status as ProductStatus,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })) as IProduct[];

      return {
        products: transformedProducts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (_error) {
      throw new AppError('Failed to search products', 500);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!product) {
        throw new AppError('Product not found', 404);
      }

      if (product.orderItems.length > 0) {
        // Soft delete - just mark as discontinued
        await this.prisma.product.update({
          where: { id },
          data: { status: ProductStatus.DISCONTINUED },
        });
      } else {
        // Hard delete if no orders reference this product
        await this.prisma.product.delete({
          where: { id },
        });
      }
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to delete product', 500);
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      return await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    } catch (_error) {
      throw new AppError('Failed to get categories', 500);
    }
  }

  async getProductsByCategory(categoryId: number): Promise<IProduct[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          categoryId,
          status: ProductStatus.ACTIVE,
          inStock: true,
        },
        include: {
          category: true,
          productPricing: true,
          productCommissions: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform products to include price from ProductPricing
      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.productPricing?.customerPrice || 0,
        categoryId: product.categoryId,
        category: product.category,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        status: product.status as ProductStatus,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })) as IProduct[];
    } catch (_error) {
      throw new AppError('Failed to get products by category', 500);
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<IProduct[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          inStock: true,
        },
        include: {
          category: true,
          productPricing: true,
          productCommissions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Transform products to include price from ProductPricing
      return products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.productPricing?.customerPrice || 0,
        categoryId: product.categoryId,
        category: product.category,
        imageUrl: product.imageUrl,
        inStock: product.inStock,
        status: product.status as ProductStatus,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })) as IProduct[];
    } catch (_error) {
      throw new AppError('Failed to get featured products', 500);
    }
  }

  async updateStock(id: number, inStock: boolean): Promise<IProduct> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: {
          inStock,
          status: inStock ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
        },
      });

      // Return the updated product with proper transformation
      const result = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          productPricing: true,
          productCommissions: true,
        },
      });

      if (!result) {
        throw new AppError('Product not found after update', 404);
      }

      // Transform product to include price from ProductPricing
      return {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.productPricing?.customerPrice || 0,
        categoryId: result.categoryId,
        category: result.category,
        imageUrl: result.imageUrl,
        inStock: result.inStock,
        status: result.status as ProductStatus,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } as IProduct;
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to update stock', 500);
    }
  }
}
