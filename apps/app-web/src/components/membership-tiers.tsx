import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function MembershipTiers() {
  const essentialBenefits = [
    '10% off on select health products',
    '5% off on partner lab tests',
    'Free shipping over minimum order value',
    'Member-only offers',
    'Monthly free gift claim at partner outlets',
  ];

  const premiumBenefits = [
    '25% off all health products',
    '15-20% off lab tests',
    'Free shipping on all orders',
    'Priority clinic bookings',
    'Family sharing (up to 4 members)',
    'Early access to promotions & bundles',
    'Monthly premium-tier gift claim at outlets',
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Membership Tiers</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our membership program to unlock exclusive health benefits and
            discounts on products and services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Essential Tier */}
          <Card className="border-2 border-gray-200 hover:border-emerald-200 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Essential Tier</CardTitle>
              <CardDescription>Free to join</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 ml-2">/ forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {essentialBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Join Now
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Tier */}
          <Card className="border-2 border-emerald-500 relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
              Recommended
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Premium Tier</CardTitle>
              <CardDescription>Free upgrade based on activity</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500 ml-2">/ with activity</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {premiumBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                Learn How to Upgrade
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
