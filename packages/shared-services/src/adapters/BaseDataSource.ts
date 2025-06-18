import { PrismaClient } from '@prisma/client';

export abstract class BaseDataSource {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    
    if (error.code === 'P2002') {
      throw new Error('A record with this information already exists');
    }
    
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    
    if (error.code === 'P2003') {
      throw new Error('Related record not found');
    }
    
    throw new Error(error.message || `Failed to ${operation}`);
  }

  protected transformDates(obj: any): any {
    if (!obj) return obj;
    
    const transformed = { ...obj };
    
    // Transform common date fields
    if (transformed.createdAt) {
      transformed.createdAt = new Date(transformed.createdAt);
    }
    
    if (transformed.updatedAt) {
      transformed.updatedAt = new Date(transformed.updatedAt);
    }
    
    if (transformed.bookingDate) {
      transformed.bookingDate = new Date(transformed.bookingDate);
    }
    
    return transformed;
  }

  protected parseJsonFields(obj: any, jsonFields: string[] = []): any {
    if (!obj) return obj;
    
    const transformed = { ...obj };
    
    jsonFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string') {
        try {
          transformed[field] = JSON.parse(transformed[field]);
        } catch (error) {
          console.warn(`Failed to parse JSON field ${field}:`, error);
        }
      }
    });
    
    return transformed;
  }
}