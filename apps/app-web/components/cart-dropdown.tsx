"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp, 
  Trash, 
  Plus, 
  Minus, 
  ShoppingBag
} from "lucide-react"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

export function CartDropdown() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { 
    cartItems, 
    cartCount, 
    cartTotal, 
    isLoading
  } = useCart()
  
  const goToCart = () => {
    router.push('/cart')
  }
  
  return (
    <div className="relative">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-emerald-500 text-white"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent 
          className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border z-50"
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Your Cart</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)}
              >
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <Separator className="my-2" />
            
            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="font-medium text-lg">Your cart is empty</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Add items to your cart to see them here
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    setOpen(false)
                    router.push('/products')
                  }}
                >
                  Browse Products
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[40vh]">
                  <div className="space-y-4 py-2">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.image_url ? (
                          <div className="h-16 w-16 rounded-md overflow-hidden relative bg-secondary">
                            <Image 
                              src={item.image_url}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-md bg-secondary flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-medium line-clamp-1">{item.product_name}</h4>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} x {formatPrice(item.price)}
                          </div>
                          <div className="font-medium mt-auto">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {cartItems.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        + {cartItems.length - 3} more {cartItems.length - 3 === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/cart" legacyBehavior passHref>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => setOpen(false)}
                      >
                        View Cart
                      </Button>
                    </Link>
                    <Link href="/cart/checkout" legacyBehavior passHref>
                      <Button 
                        className="w-full"
                        onClick={() => setOpen(false)}
                      >
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
