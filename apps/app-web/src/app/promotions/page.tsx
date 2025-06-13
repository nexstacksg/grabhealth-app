import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { neon } from '@neondatabase/serverless';
import { CalendarIcon } from 'lucide-react';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);

// Fetch promotions from database
async function getPromotions() {
  const promotions = await sql`
    SELECT * FROM promotions
    ORDER BY start_date DESC
  `;
  return promotions;
}

export default async function PromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="container mx-auto px-4 py-6 md:py-16 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
          Current Promotions
        </h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Take advantage of our limited-time offers and exclusive deals on
          health products and services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promotion={promo} />
        ))}
      </div>
    </div>
  );
}

function PromotionCard({ promotion }: { promotion: any }) {
  const startDate = new Date(promotion.start_date);
  const endDate = new Date(promotion.end_date);
  const isActive = new Date() >= startDate && new Date() <= endDate;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 md:h-64">
        <Image
          src={promotion.image_url || '/placeholder.svg?height=300&width=600'}
          alt={promotion.title}
          fill
          className="object-cover"
        />
        {promotion.is_premium_only && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-sm font-medium">
            Premium Only
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{promotion.title}</CardTitle>
          {isActive ? (
            <Badge className="bg-emerald-500">Active</Badge>
          ) : (
            <Badge variant="outline">Upcoming</Badge>
          )}
        </div>
        <CardDescription className="flex items-center mt-2">
          <CalendarIcon className="h-4 w-4 mr-1" />
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{promotion.description}</p>
        {promotion.discount_percentage && (
          <div className="mt-4 inline-block bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
            {promotion.discount_percentage}% Off
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
