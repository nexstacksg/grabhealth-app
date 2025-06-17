'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
        <p className="text-gray-600">Manage your services and pricing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Services management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}