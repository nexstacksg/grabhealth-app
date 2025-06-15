import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Gift } from 'lucide-react';
import services from '@/lib/services';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  let partners: any[] = [];
  let giftItems: any[] = [];

  try {
    const partnerData = await services.partner.getPartnerDashboard();
    // Since we don't have a getPartners function, we'll use sample data or the dashboard data
    partners = partnerData.recentPartners || [];
  } catch (error) {
    console.error('Error fetching partners:', error);
  }

  // For gift items, we'll use sample data since there's no specific service for it yet
  giftItems = [
    {
      id: 1,
      name: 'Health Supplement Package',
      description: 'Monthly health supplement package',
      required_purchases: 1,
      tier_name: 'Essential',
    },
    {
      id: 2,
      name: 'Premium Wellness Kit',
      description: 'Premium wellness and fitness kit',
      required_purchases: 3,
      tier_name: 'Premium',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:py-16 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
          Our Partner Locations
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Visit our partner pharmacies and clinics to claim your monthly gifts
          and access exclusive member benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <Card key={partner.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{partner.name || `Partner ${partner.id}`}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {partner.address || 'Address not available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {partner.phone || 'Phone not available'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {partner.hours || 'Hours: Mon-Fri 9AM-6PM'}
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <Gift className="h-4 w-4 mr-2" />
                    {partner.gift_claims || 0} gifts claimed
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No partner locations available at the moment.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Gift Items Section */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            Available Gifts
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Claim these exclusive gifts when you visit our partner locations.
            Requirements vary by membership tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giftItems.map((gift) => (
            <Card key={gift.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{gift.name}</CardTitle>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {gift.tier_name}
                  </span>
                </div>
                <CardDescription>{gift.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <strong>Required:</strong> {gift.required_purchases} purchase(s)
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}