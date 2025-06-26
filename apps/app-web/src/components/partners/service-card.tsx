import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Gift } from 'lucide-react';
import { IService } from '@app/shared-types';

interface ServiceCardProps {
  service: IService;
  onSelect: (service: IService) => void;
  isSelected: boolean;
  isEligibleForFreeCheckup?: boolean;
}

export function ServiceCard({
  service,
  onSelect,
  isSelected,
  isEligibleForFreeCheckup,
}: ServiceCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
          : 'hover:border-gray-300'
      }`}
      onClick={() => onSelect(service)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{service.name}</CardTitle>
            {isEligibleForFreeCheckup && service.category === 'Body Check' && (
              <div className="flex items-center gap-1 mt-1 text-green-600">
                <Gift className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Eligible for free checkup
                </span>
              </div>
            )}
          </div>
          <Badge
            variant={
              service.category === 'Body Check' ? 'default' : 'secondary'
            }
          >
            {service.category}
          </Badge>
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {service.duration} min
          </div>
          <div className="flex items-center font-semibold">
            {isEligibleForFreeCheckup && service.category === 'Body Check' ? (
              <>
                <span className="line-through text-gray-500 mr-2">
                  ${service.price.toFixed(2)}
                </span>
                <span className="text-green-600">FREE</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                {service.price.toFixed(2)}
              </>
            )}
          </div>
        </div>
        <Button
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
        >
          {isSelected ? '✓ Selected - Book Now' : 'Select Service'}
        </Button>
      </CardContent>
    </Card>
  );
}
