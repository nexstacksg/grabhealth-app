"use client"

import { useState } from "react"
import { ShoppingCart, Check, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showQuantity?: boolean;
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  showQuantity = false,
  className = "",
  disabled = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addToCart } = useCart()
  
  const handleAddToCart = async () => {
    setIsAdding(true)
    await addToCart(product, quantity)
    setIsAdding(false)
    setIsAdded(true)
    
    // Reset the added state after a delay
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }
  
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99))
  }
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1))
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      {showQuantity && (
        <div className="flex items-center border rounded-md mr-2">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isAdding}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">
            {quantity}
          </span>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none" 
            onClick={incrementQuantity}
            disabled={quantity >= 99 || isAdding}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <Button
        type="button"
        variant={variant}
        size={size}
        className={`${className} ${isAdded ? "bg-emerald-600" : ""}`}
        onClick={handleAddToCart}
        disabled={isAdding || disabled}
      >
        {isAdding ? (
          <div className="flex items-center">
            <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
            Adding...
          </div>
        ) : isAdded ? (
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-2" />
            Added
          </div>
        ) : (
          <div className="flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </div>
        )}
      </Button>
    </div>
  )
}
