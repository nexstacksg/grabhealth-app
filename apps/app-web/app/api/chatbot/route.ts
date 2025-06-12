import { NextResponse } from "next/server"
import OpenAI from "openai"
import { Pool } from "pg"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get products from the database for context
    const products = await getRelevantProducts(message)
    
    // Format products for the AI prompt
    const productsContext = products.map((p: any) => 
      `- ${p.name}: ${p.description}. Price: $${p.price}. Category: ${p.category}.`
    ).join('\n')
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, productsContext, products)
    
    return NextResponse.json({
      message: aiResponse.message,
      products: aiResponse.recommendedProducts
    })
  } catch (error) {
    console.error("Error in chatbot API:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

// Get relevant products based on the user message
async function getRelevantProducts(message: string) {
  try {
    // Extract potential keywords from the message
    const keywords = extractKeywords(message)
    
    // Handle category-based search
    const categoryKeywords = keywords.filter(keyword => 
      ["Vitamins", "Supplements", "First Aid", "Personal Care"].includes(keyword)
    )
    
    let products = [];
    const client = await pool.connect();
    
    try {
      if (categoryKeywords.length > 0) {
        // Search by categories
        const category = categoryKeywords[0];
        const result = await client.query(
          'SELECT * FROM products WHERE category = $1 ORDER BY in_stock DESC, price ASC LIMIT 5',
          [category]
        );
        products = result.rows;
      } else if (keywords.length > 0) {
        // Search by keywords in name or description
        const keyword = keywords[0];
        const searchPattern = `%${keyword.toLowerCase()}%`;
        const result = await client.query(
          'SELECT * FROM products WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1 ORDER BY in_stock DESC, price ASC LIMIT 5',
          [searchPattern]
        );
        products = result.rows;
      } else {
        // Fallback to featured products
        return await getFeaturedProducts();
      }
    } finally {
      client.release();
    }
    
    if (!products || products.length === 0) {
      return await getFeaturedProducts();
    }
    
    return products;
  } catch (error) {
    console.error("Error getting relevant products:", error);
    return await getFeaturedProducts();
  }
}

// Extract relevant keywords from the user message
function extractKeywords(message: string): string[] {
  // Normalize the message for better matching
  const normalizedMessage = message.toLowerCase()
  
  // Define categories and their related keywords
  const keywordMap: Record<string, string[]> = {
    "Vitamins": ["vitamin", "multivitamin", "supplement", "immune", "immunity", "health", "daily"],
    "Supplements": ["protein", "omega", "fish oil", "supplement", "muscle", "recovery", "joint", "health"],
    "First Aid": ["bandage", "first aid", "emergency", "wound", "cut", "injury", "pain"],
    "Personal Care": ["personal", "hygiene", "care", "shower", "bath", "skin", "hair"]
  }
  
  // Check for category mentions
  const categoryMatches: string[] = []
  
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(keyword => normalizedMessage.includes(keyword))) {
      categoryMatches.push(category)
    }
  }
  
  // If no categories matched, extract individual words as potential keywords
  if (categoryMatches.length === 0) {
    // Remove common words and keep potential product-related terms
    const words = normalizedMessage.split(/\s+/)
    const filteredWords = words.filter(word => 
      word.length > 3 && 
      !["what", "which", "where", "when", "how", "can", "you", "the", "for", "and", "that", "this", "with"].includes(word)
    )
    return filteredWords
  }
  
  return categoryMatches
}

// Get featured products as fallback
async function getFeaturedProducts() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE in_stock = true ORDER BY RANDOM() LIMIT 3'
      );
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error getting featured products:", error);
    
    // Return a minimal set of fallback products if database query fails
    return [
      {
        id: 1,
        name: "Multivitamin Daily",
        description: "Complete daily multivitamin with essential nutrients",
        price: 19.99,
        discount_essential: 0.1,
        discount_premium: 0.25,
        category: "Vitamins",
        image_url: "https://placehold.co/300x300/e6f7ff/0a85ff?text=Multivitamin",
        in_stock: true
      }
    ];
  }
}

// Generate AI response using OpenAI
async function generateAIResponse(userMessage: string, productsContext: string, products: any[]) {
  try {
    const systemPrompt = `You are HealthBot, a friendly and helpful assistant for GrabHealth, an online health and wellness store. 

Your personality:
- Warm, empathetic, and conversational (like talking to a knowledgeable friend)
- Helpful without being pushy
- Informative but concise
- Slightly enthusiastic about health and wellness

Here are the available products that might be relevant to the user's query:
${productsContext}

When responding to the user:
1. Use a warm, conversational tone with natural language (avoid robotic responses)
2. Recommend 1-3 specific products from the list above that best match their needs
3. Briefly explain the benefits of each recommended product in relation to their query
4. Keep your responses under 120 words and easy to read
5. If appropriate, mention any membership discounts available (Essential tier: 10% off, Premium tier: 25% off)
6. If the user asks about something unrelated to health products, gently guide them back to health topics

FORMATTING INSTRUCTIONS:
- Use **bold text** for important information, product names, and key benefits
- Use bullet points (•) for listing features or benefits
- Use numbered lists (1., 2., etc.) for steps or prioritized recommendations
- Put product names in [square brackets] for special highlighting
- Structure your response with clear sections and readable formatting

Do not make up any products that aren't in the list provided. Avoid overly formal language or medical jargon.`

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 300
    })

    const aiMessage = response.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process your request. How else can I help you find the right health products for your needs?"

    // Determine which products to recommend based on the AI response
    const recommendedProducts = determineRecommendedProducts(aiMessage, products)
    
    return {
      message: aiMessage,
      recommendedProducts: recommendedProducts.slice(0, 3) // Limit to 3 products for UI
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return {
      message: "Sorry about that! I'm having a bit of trouble connecting to our product database right now. Could you try asking me something else about health products, or try again in a moment?",
      recommendedProducts: products.slice(0, 3) // Return first 3 products as fallback
    }
  }
}

// Determine which products to recommend based on the AI response
function determineRecommendedProducts(aiMessage: string, products: any[]) {
  if (products.length <= 3) {
    return products
  }
  
  // Score products based on how many times they're mentioned in the AI response
  const productScores = products.map(product => {
    const nameMatches = (aiMessage.match(new RegExp(product.name, 'gi')) || []).length
    const categoryMatches = (aiMessage.match(new RegExp(product.category, 'gi')) || []).length
    
    // Extract key terms from product description
    const descriptionTerms = product.description
      .toLowerCase()
      .split(/\s+/)
      .filter((term: string) => term.length > 4)
      
    // Count how many description terms appear in the AI message
    const descriptionMatches = descriptionTerms.reduce((count: number, term: string) => {
      return count + (aiMessage.toLowerCase().includes(term) ? 1 : 0)
    }, 0)
    
    return {
      product,
      score: (nameMatches * 3) + (categoryMatches * 2) + descriptionMatches
    }
  })
  
  // Sort by score (highest first) and return the products
  return productScores
    .sort((a, b) => b.score - a.score)
    .map(item => item.product)
}
