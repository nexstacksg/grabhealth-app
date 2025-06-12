import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { message, membershipTier = "none", userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Create system prompt based on membership tier
    let systemPrompt = `You are GrabHealth AI, a helpful assistant for the GrabHealth platform. 
    The user has a ${membershipTier} membership tier.`

    // Add tier-specific information
    if (membershipTier === "premium") {
      systemPrompt += `
      As a premium member, they receive:
      - 25% off all health products
      - 15-20% off lab tests
      - Free shipping on all orders
      - Priority clinic bookings
      - Family sharing (up to 4 members)
      - Early access to promotions & bundles
      - Monthly premium-tier gift claim at outlets
      
      Provide personalized recommendations and highlight premium benefits when appropriate.`
    } else if (membershipTier === "essential") {
      systemPrompt += `
      As an essential member, they receive:
      - 10% off on select health products
      - 5% off on partner lab tests
      - Free shipping over minimum order value
      - Member-only offers
      - Monthly free gift claim at partner outlets
      
      Provide helpful information and mention how they can upgrade to premium when appropriate.`
    } else {
      systemPrompt += `
      They are not currently a member. Explain the benefits of joining our free Essential membership:
      - 10% off on select health products
      - 5% off on partner lab tests
      - Free shipping over minimum order value
      - Member-only offers
      - Monthly free gift claim at partner outlets
      
      Encourage them to sign up for free.`
    }

    // Generate AI response
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: message,
    })

    // Log the interaction for future analysis
    // In a production environment, you would store this in your database
    console.log({
      userId,
      membershipTier,
      userMessage: message,
      aiResponse: text,
      timestamp: new Date(),
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in AI chat:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
