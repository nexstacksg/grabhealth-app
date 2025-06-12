import { PrismaClient, Product, Prisma } from "@prisma/client";
import {
  IProductCreate,
  IProductUpdate,
  ProductSearchParams,
  ProductSearchResponse,
  ProductStatus,
} from "@app/shared-types";
import { AppError } from "../middlewares/error";

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async createProduct(data: IProductCreate): Promise<Product> {
    try {
      // Validate category exists if provided
      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category || !category.isActive) {
          throw new AppError("Invalid or inactive category", 400);
        }
      }

      return await this.prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          discountEssential: data.discountEssential ?? 0.1,
          discountPremium: data.discountPremium ?? 0.25,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          inStock: data.inStock ?? true,
          status: data.status ?? ProductStatus.ACTIVE,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create product", 500);
    }
  }

  async updateProduct(id: number, data: IProductUpdate): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Validate category if updating
      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId },
        });
        if (!category || !category.isActive) {
          throw new AppError("Invalid or inactive category", 400);
        }
      }

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.discountEssential !== undefined && {
            discountEssential: data.discountEssential,
          }),
          ...(data.discountPremium !== undefined && {
            discountPremium: data.discountPremium,
          }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.inStock !== undefined && { inStock: data.inStock }),
          ...(data.status && { status: data.status }),
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update product", 500);
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    try {
      return await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          productCommissions: true,
        },
      });
    } catch (error) {
      throw new AppError("Failed to get product", 500);
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
        sortBy = "created",
        sortOrder = "desc",
        page = 1,
        limit = 10,
      } = params;

      const where: Prisma.ProductWhereInput = {
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
        ...(category && {
          category: {
            name: { contains: category, mode: "insensitive" },
          },
        }),
        ...(categoryId && { categoryId }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
        ...(inStock !== undefined && { inStock }),
        status: ProductStatus.ACTIVE,
      };

      const orderBy: Prisma.ProductOrderByWithRelationInput = {};
      if (sortBy === "price") {
        orderBy.price = sortOrder;
      } else if (sortBy === "name") {
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
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new AppError("Failed to search products", 500);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { orderItems: true },
      });

      if (!product) {
        throw new AppError("Product not found", 404);
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete product", 500);
    }
  }

  async getCategories(): Promise<any[]> {
    try {
      return await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
    } catch (error) {
      throw new AppError("Failed to get categories", 500);
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: {
          categoryId,
          status: ProductStatus.ACTIVE,
          inStock: true,
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new AppError("Failed to get products by category", 500);
    }
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        where: {
          status: ProductStatus.ACTIVE,
          inStock: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      throw new AppError("Failed to get featured products", 500);
    }
  }

  async updateStock(id: number, inStock: boolean): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          inStock,
          status: inStock ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
        },
      });
    } catch (error) {
      throw new AppError("Failed to update stock", 500);
    }
  }
}
