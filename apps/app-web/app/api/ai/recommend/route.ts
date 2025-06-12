import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { userId, membershipTier = "none", healthProfile, preferences } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get products from database
    let products
    try {
      // Create products table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          discount_essential DECIMAL(10, 2),
          discount_premium DECIMAL(10, 2),
          category_id INTEGER,
          image_url TEXT,
          in_stock BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      products = await sql`
        SELECT 
          id, 
          name, 
          description, 
          price, 
          discount_essential, 
          discount_premium, 
          image_url
        FROM products
        WHERE in_stock = true
        LIMIT 20
      `
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback to sample products if database query fails
      products = [
        {
          id: 1,
          name: "Advanced Cold Relief",
          description: "Fast-acting relief for cold symptoms",
          price: 12.99,
          discount_essential: 0.1,
          discount_premium: 0.25,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 2,
          name: "Allergy Defense Plus",
          description: "24-hour relief from seasonal allergies",
          price: 18.99,
          discount_essential: 0.1,
          discount_premium: 0.25,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 3,
          name: "Daily Multivitamin Complex",
          description: "Complete daily nutrition in one tablet",
          price: 24.99,
          discount_essential: 0.1,
          discount_premium: 0.25,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 4,
          name: "Probiotic Digestive Support",
          description: "Daily probiotic for gut health",
          price: 29.99,
          discount_essential: 0.1,
          discount_premium: 0.25,
          image_url: "/placeholder.svg?height=200&width=200",
        },
        {
          id: 5,
          name: "Stress Relief Formula",
          description: "Natural supplement for stress management",
          price: 22.99,
          discount_essential: 0.1,
          discount_premium: 0.25,
          image_url: "/placeholder.svg?height=200&width=200",
        },
      ]
    }

    // Create prompt for AI recommendation
    const userProfile = {
      membershipTier,
      healthProfile: healthProfile || "No health profile provided",
      preferences: preferences || "No preferences provided",
    }

    const prompt = `
      Based on the following user profile, recommend 3 products from the list below.
      For each recommendation, explain why it's a good fit for the user.
      
      User Profile:
      - Membership Tier: ${userProfile.membershipTier}
      - Health Profile: ${userProfile.healthProfile}
      - Preferences: ${userProfile.preferences}
      
      Available Products:
      ${products.map((p: any) => `- ${p.name}: ${p.description} ($${p.price})`).join("\n")}
      
      Format your response as a JSON array with the following structure:
      [
        {
          "productId": 1,
          "reason": "This product is recommended because..."
        },
        ...
      ]
    `

    // Generate AI recommendations
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse AI response
    let recommendations
    try {
      recommendations = JSON.parse(text)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return NextResponse.json({ error: "Failed to parse AI recommendations" }, { status: 500 })
    }

    // Enhance recommendations with product details
    const enhancedRecommendations = recommendations.map((rec: any) => {
      const product = products.find((p: any) => p.id === rec.productId)
      if (!product) return rec

      // Calculate discounted price based on membership tier
      let discountedPrice = product.price
      if (membershipTier === "essential" && product.discount_essential) {
        discountedPrice = product.price * (1 - product.discount_essential)
      } else if (membershipTier === "premium" && product.discount_premium) {
        discountedPrice = product.price * (1 - product.discount_premium)
      }

      return {
        ...rec,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          discountedPrice,
          imageUrl: product.image_url,
        },
      }
    })

    return NextResponse.json({ recommendations: enhancedRecommendations })
  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
