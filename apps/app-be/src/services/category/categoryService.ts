import { PrismaClient, Prisma } from '@prisma/client';
import type { Category } from '@prisma/client';
import { ICategoryCreate, ICategoryUpdate } from '@app/shared-types';
import { AppError } from '../../middleware/error/errorHandler';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  async createCategory(data: ICategoryCreate): Promise<Category> {
    try {
      // Check if slug already exists
      const existing = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new AppError('Category slug already exists', 400);
      }

      // Validate parent category if provided
      if (data.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: data.parentId },
        });
        if (!parent) {
          throw new AppError('Parent category not found', 404);
        }
      }

      return await this.prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
          parentId: data.parentId,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to create category', 500);
    }
  }

  async updateCategory(id: number, data: ICategoryUpdate): Promise<Category> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check slug uniqueness if updating
      if (data.slug && data.slug !== category.slug) {
        const existing = await this.prisma.category.findUnique({
          where: { slug: data.slug },
        });
        if (existing) {
          throw new AppError('Category slug already exists', 400);
        }
      }

      // Validate parent category if updating
      if (data.parentId !== undefined) {
        if (data.parentId === id) {
          throw new AppError('Category cannot be its own parent', 400);
        }

        if (data.parentId) {
          const parent = await this.prisma.category.findUnique({
            where: { id: data.parentId },
          });
          if (!parent) {
            throw new AppError('Parent category not found', 404);
          }

          // Check for circular reference
          if (await this.wouldCreateCircularReference(id, data.parentId)) {
            throw new AppError('This would create a circular reference', 400);
          }
        }
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.parentId !== undefined && { parentId: data.parentId }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        },
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to update category', 500);
    }
  }

  async getCategory(id: number): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          products: {
            where: {
              status: 'ACTIVE',
              inStock: true,
            },
            take: 10,
          },
          _count: {
            select: { products: true },
          },
        },
      });
    } catch (_error) {
      throw new AppError('Failed to get category', 500);
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await this.prisma.category.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        },
      });
    } catch (_error) {
      throw new AppError('Failed to get category', 500);
    }
  }

  async getAllCategories(
    includeInactive: boolean = false
  ): Promise<Category[]> {
    try {
      const where: Prisma.CategoryWhereInput = includeInactive
        ? {}
        : { isActive: true };

      return await this.prisma.category.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          parent: true,
          children: {
            where: includeInactive ? {} : { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { products: true },
          },
        },
      });
    } catch (_error) {
      throw new AppError('Failed to get categories', 500);
    }
  }

  async getCategoryTree(): Promise<Category[]> {
    try {
      // Get all root categories (no parent)
      const rootCategories = await this.prisma.category.findMany({
        where: {
          parentId: null,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      return rootCategories;
    } catch (_error) {
      throw new AppError('Failed to get category tree', 500);
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
          children: true,
        },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }

      // Check if category has products
      if (category.products.length > 0) {
        throw new AppError('Cannot delete category with products', 400);
      }

      // Check if category has children
      if (category.children.length > 0) {
        throw new AppError('Cannot delete category with subcategories', 400);
      }

      await this.prisma.category.delete({
        where: { id },
      });
    } catch (_error) {
      if (_error instanceof AppError) throw _error;
      throw new AppError('Failed to delete category', 500);
    }
  }

  private async wouldCreateCircularReference(
    categoryId: number,
    parentId: number
  ): Promise<boolean> {
    let currentId = parentId;
    const visited = new Set<number>();

    while (currentId) {
      if (currentId === categoryId || visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);

      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = parent?.parentId || 0;
    }

    return false;
  }

  async generateSlug(name: string): Promise<string> {
    let slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug exists and add number if necessary
    let counter = 1;
    let finalSlug = slug;

    while (
      await this.prisma.category.findUnique({ where: { slug: finalSlug } })
    ) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  async reorderCategories(
    categoryOrders: Array<{ id: number; sortOrder: number }>
  ): Promise<void> {
    try {
      // Update all categories in a transaction
      await this.prisma.$transaction(
        categoryOrders.map(({ id, sortOrder }) =>
          this.prisma.category.update({
            where: { id },
            data: { sortOrder },
          })
        )
      );
    } catch (_error) {
      throw new AppError('Failed to reorder categories', 500);
    }
  }
}
