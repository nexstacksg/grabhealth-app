'use client';


import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  ShoppingBag,
  Users,
  Gift,
} from 'lucide-react';

export default function MembershipPage() {
  const router = useRouter();



  return (
    <div className="container mx-auto px-4 py-16 md:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Welcome to GrabHealth AI!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Congratulations! You're already a member and have access to all our benefits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center">
                <ShoppingBag className="h-8 w-8 text-emerald-500 mb-2" />
                <h3 className="font-medium">Exclusive Products</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Access to health products at member prices
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-emerald-500 mb-2" />
                <h3 className="font-medium">Referral Benefits</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Earn commissions by referring friends
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Gift className="h-8 w-8 text-emerald-500 mb-2" />
                <h3 className="font-medium">Special Offers</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Regular promotions and discounts
                </p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/products')}
              >
                Browse Products
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
