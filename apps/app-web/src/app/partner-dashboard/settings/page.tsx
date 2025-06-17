'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Partner Settings</h1>
        <p className="text-gray-600">Manage your partner profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Settings management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}