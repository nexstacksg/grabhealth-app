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

// Static page - no dynamic rendering needed
export const dynamic = 'force-static';

// Sample partner data - in production this would come from a public API endpoint
const samplePartners = [
  {
    id: 1,
    name: 'GrabHealth Pharmacy - Downtown',
    address: '123 Main Street, Downtown District',
    phone: '+60 3-1234 5678',
    hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
    gift_claims: 156,
  },
  {
    id: 2,
    name: 'Wellness Clinic - Midtown',
    address: '456 Health Avenue, Midtown',
    phone: '+60 3-2345 6789',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-3PM',
    gift_claims: 89,
  },
  {
    id: 3,
    name: 'GrabHealth Center - Eastside',
    address: '789 Wellness Road, East District',
    phone: '+60 3-3456 7890',
    hours: 'Mon-Sat: 9AM-7PM, Sun: Closed',
    gift_claims: 234,
  },
  {
    id: 4,
    name: 'Partner Pharmacy - Westend',
    address: '321 Care Street, West End',
    phone: '+60 3-4567 8901',
    hours: 'Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-5PM',
    gift_claims: 167,
  },
  {
    id: 5,
    name: 'Health & Wellness Store - North Point',
    address: '654 Medical Plaza, North Point',
    phone: '+60 3-5678 9012',
    hours: 'Mon-Sat: 8:30AM-7:30PM, Sun: 10AM-4PM',
    gift_claims: 198,
  },
  {
    id: 6,
    name: 'GrabHealth Express - South Bay',
    address: '987 Health Boulevard, South Bay',
    phone: '+60 3-6789 0123',
    hours: 'Daily: 8AM-9PM',
    gift_claims: 312,
  },
];

// Sample gift items data
const giftItems = [
  {
    id: 1,
    name: 'Welcome Health Kit',
    description: 'Starter pack with essential vitamins and health supplements',
    required_purchases: 0,
    tier_name: 'New Member',
  },
  {
    id: 2,
    name: 'Monthly Wellness Package',
    description: 'Curated selection of seasonal health products',
    required_purchases: 1,
    tier_name: 'Active Member',
  },
  {
    id: 3,
    name: 'Premium Supplement Set',
    description: 'High-quality supplements and immunity boosters',
    required_purchases: 3,
    tier_name: 'Silver Member',
  },
  {
    id: 4,
    name: 'Elite Health Bundle',
    description: 'Exclusive products with personal health consultation',
    required_purchases: 5,
    tier_name: 'Gold Member',
  },
];

export default function PartnersPage() {
  const partners = samplePartners;
  const gifts = giftItems;

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
        {partners.map((partner) => (
          <Card key={partner.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{partner.name}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {partner.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {partner.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {partner.hours}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Gift className="h-4 w-4 mr-2" />
                  {partner.gift_claims} gifts claimed
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
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
          {gifts.map((gift) => (
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
                  <strong>Required:</strong> {gift.required_purchases === 0 ? 'Free for new members' : `${gift.required_purchases} purchase(s)`}
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