import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    // For now, return featured/random products as "trending"
    // In a real implementation, this would analyze sales data, views, etc.
    const { products } = await productService.searchProducts({
      limit,
      inStock: true,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Trending products error:', error);
    return NextResponse.json([]);
  }
}