import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { 
  initializeCartTable, 
  getCartItems, 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart 
} from "@/lib/cart"

// GET /api/cart - Get cart items for current user
export async function GET() {
  try {
    // Initialize cart table
    await initializeCartTable()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get cart items
    const cartItems = await getCartItems(user.id)
    
    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error("Error fetching cart items:", error)
    return NextResponse.json(
      { error: "Failed to fetch cart items" }, 
      { status: 500 }
    )
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: Request) {
  try {
    // Initialize cart table
    await initializeCartTable()
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get request body
    const { productId, productName, quantity, price, imageUrl } = await request.json()
    
    // Validate required fields
    if (!productId || !productName || !quantity || !price) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }
    
    // Add item to cart
    const cartItem = await addToCart(
      user.id,
      productId,
      productName,
      quantity,
      price,
      imageUrl
    )
    
    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("Error adding item to cart:", error)
    return NextResponse.json(
      { error: "Failed to add item to cart" }, 
      { status: 500 }
    )
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get request body
    const { cartItemId, quantity } = await request.json()
    
    // Validate required fields
    if (!cartItemId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }
    
    // Update cart item quantity
    const cartItem = await updateCartItemQuantity(
      user.id,
      cartItemId,
      quantity
    )
    
    return NextResponse.json({ cartItem })
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Failed to update cart item" }, 
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Remove item from cart or clear cart
export async function DELETE(request: Request) {
  try {
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get("itemId")
    const clearAll = searchParams.get("clearAll")
    
    if (clearAll === "true") {
      // Clear entire cart
      await clearCart(user.id)
      return NextResponse.json({ success: true })
    } else if (cartItemId) {
      // Remove specific item
      await removeFromCart(user.id, parseInt(cartItemId))
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Missing itemId or clearAll parameter" }, 
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { error: "Failed to remove cart item" }, 
      { status: 500 }
    )
  }
}
