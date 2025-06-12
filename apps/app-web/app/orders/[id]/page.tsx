"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle
} from "lucide-react"

// Order data types
interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  created_at?: string;
}

interface Order {
  id: number;
  user_id: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  created_at: string;
  items?: OrderItem[];
}

interface OrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params)
  
  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        setIsLoading(true)
        
        // Check if user is authenticated
        const userResponse = await fetch('/api/auth/user')
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/auth/login')
            return
          }
          throw new Error("Failed to authenticate")
        }
        
        // Fetch order details
        const orderId = unwrappedParams.id
        const response = await fetch(`/api/orders/${orderId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Order not found")
          }
          throw new Error("Failed to fetch order details")
        }
        
        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError(error instanceof Error ? error.message : "Failed to load order details")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [unwrappedParams.id, router])
  
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "processing": return <Clock className="h-6 w-6 text-blue-500" />
      case "shipped": return <Truck className="h-6 w-6 text-amber-500" />
      case "delivered": return <CheckCircle className="h-6 w-6 text-green-500" />
      case "cancelled": return <XCircle className="h-6 w-6 text-red-500" />
      default: return <Package className="h-6 w-6 text-gray-500" />
    }
  }
  
  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
      case "processing": return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "shipped": return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "delivered": return "bg-green-100 text-green-800 hover:bg-green-100"
      case "cancelled": return "bg-red-100 text-red-800 hover:bg-red-100"
      default: return ""
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-6 md:py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-6 md:py-16">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="container max-w-4xl py-6 md:py-16">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.push('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Order not found</h3>
              <p className="text-gray-500">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container max-w-4xl py-4 md:py-12">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.push('/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>
      
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          {getStatusIcon(order.status)}
          <Badge className={`ml-2 text-sm ${getStatusBadgeColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            Items included in your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No items found for this order</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-end">
          <Separator className="my-4 w-full md:w-1/3 ml-auto" />
          <div className="space-y-1 text-right">
            <div className="flex justify-between w-full md:w-1/3">
              <span className="font-medium">Total:</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
          <CardDescription>
            Track the status of your order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Order timeline - this would be dynamic in a real app */}
            <div className="flex">
              <div className="mr-4">
                <div className="bg-emerald-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="font-medium">Order Placed</p>
                <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
              </div>
            </div>
            
            {order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? (
              <div className="flex">
                <div className="mr-4">
                  <div className={`${order.status !== "processing" ? "bg-emerald-100" : "bg-blue-100"} rounded-full p-2`}>
                    <Clock className={`h-5 w-5 ${order.status !== "processing" ? "text-emerald-600" : "text-blue-600"}`} />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm text-gray-500">
                    {order.status === "processing" ? "Your order is being processed" : "Completed"}
                  </p>
                </div>
              </div>
            ) : null}
            
            {order.status === "shipped" || order.status === "delivered" ? (
              <div className="flex">
                <div className="mr-4">
                  <div className={`${order.status !== "shipped" ? "bg-emerald-100" : "bg-amber-100"} rounded-full p-2`}>
                    <Truck className={`h-5 w-5 ${order.status !== "shipped" ? "text-emerald-600" : "text-amber-600"}`} />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Shipped</p>
                  <p className="text-sm text-gray-500">
                    {order.status === "shipped" ? "Your order is on the way" : "Completed"}
                  </p>
                </div>
              </div>
            ) : null}
            
            {order.status === "delivered" ? (
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-emerald-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Delivered</p>
                  <p className="text-sm text-gray-500">Your order has been delivered</p>
                </div>
              </div>
            ) : null}
            
            {order.status === "cancelled" ? (
              <div className="flex">
                <div className="mr-4">
                  <div className="bg-red-100 rounded-full p-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">Cancelled</p>
                  <p className="text-sm text-gray-500">Your order has been cancelled</p>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
