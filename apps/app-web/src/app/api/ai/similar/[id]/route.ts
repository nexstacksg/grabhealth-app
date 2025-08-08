import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/product.service';
import { IProduct } from '@app/shared-types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '4');

    // Get the source product
    const sourceProduct = await productService.getProduct(id);

    if (!sourceProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get products from the same category
    let similarProducts: IProduct[] = [];
    
    if (sourceProduct.category?.slug) {
      const { products } = await productService.searchProducts({
        category: sourceProduct.category.slug,
        limit: limit + 5, // Get extra to filter out the source product
        inStock: true,
      });

      // Filter out the source product and limit results
      similarProducts = products
        .filter(p => p.documentId !== sourceProduct.documentId)
        .slice(0, limit);
    }

    // If not enough similar products, get random products
    if (similarProducts.length < limit) {
      const { products } = await productService.searchProducts({
        limit: limit - similarProducts.length + 5,
        inStock: true,
      });

      const additionalProducts = products
        .filter(p => 
          p.documentId !== sourceProduct.documentId &&
          !similarProducts.some(sp => sp.documentId === p.documentId)
        )
        .slice(0, limit - similarProducts.length);

      similarProducts = [...similarProducts, ...additionalProducts];
    }

    return NextResponse.json(similarProducts);
  } catch (error) {
    console.error('Similar products error:', error);
    return NextResponse.json(
      { error: 'Failed to get similar products' },
      { status: 500 }
    );
  }
}