import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';
import { IService } from '@app/shared-types';

interface ServiceCardProps {
  service: IService;
  onSelect: (service: IService) => void;
  isSelected: boolean;
}

export function ServiceCard({ service, onSelect, isSelected }: ServiceCardProps) {
  return (
    <Card className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          <Badge variant={service.category === 'Body Check' ? 'default' : 'secondary'}>
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
            <DollarSign className="h-4 w-4" />
            {service.price.toFixed(2)}
          </div>
        </div>
        <Button 
          className="w-full"
          variant={isSelected ? 'default' : 'outline'}
          onClick={() => onSelect(service)}
        >
          {isSelected ? 'Selected' : 'Select Service'}
        </Button>
      </CardContent>
    </Card>
  );
}