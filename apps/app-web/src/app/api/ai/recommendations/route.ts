import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openaiModel, SYSTEM_PROMPT } from '@/lib/openai';
import { productService } from '@/services/product.service';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // Get user session from cookies if userId not provided
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    // TODO: Use session info for personalized recommendations in the future
    const _hasSession = !!sessionCookie?.value;

    // Fetch products from Strapi
    const { products } = await productService.searchProducts({ 
      limit: 12,
      inStock: true 
    });

    if (products.length === 0) {
      return NextResponse.json([]);
    }

    // Create a prompt for AI to select and rank products
    const productList = products.map((p, idx) => 
      `${idx + 1}. ${p.name} - ${p.category?.name || 'General'} - $${p.price} - ${p.description?.slice(0, 100) || 'No description'}`
    ).join('\n');

    const prompt = `Based on the following products, select and rank the top 8 products that would be good general recommendations for a health-conscious customer. Consider variety, popularity, and general wellness benefits.

Available products:
${productList}

Return only the numbers of the selected products in order of recommendation, separated by commas. For example: "3,7,1,5,2,8,4,6"`;

    // Get AI recommendations
    const { text } = await generateText({
      model: openaiModel,
      system: SYSTEM_PROMPT,
      prompt,
      temperature: 0.3,
      maxRetries: 2,
    });

    // Parse AI response to get product indices
    const recommendedIndices = text
      .split(',')
      .map(num => parseInt(num.trim()) - 1)
      .filter(idx => !isNaN(idx) && idx >= 0 && idx < products.length)
      .slice(0, 8);

    // If AI didn't provide valid indices, fallback to first 8 products
    const recommendedProducts = recommendedIndices.length > 0
      ? recommendedIndices.map(idx => products[idx])
      : products.slice(0, 8);

    return NextResponse.json(recommendedProducts);
  } catch (error) {
    console.error('Recommendations error:', error);
    
    // Fallback to returning some products without AI
    try {
      const { products } = await productService.searchProducts({ 
        limit: 8,
        inStock: true 
      });
      return NextResponse.json(products);
    } catch (_fallbackError) {
      return NextResponse.json([]);
    }
  }
}