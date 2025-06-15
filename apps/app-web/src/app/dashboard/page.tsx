import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import services from '@/lib/services';

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

// Dashboard page component
export default async function DashboardPage() {
  // Fetch data from services with error handling
  let membershipStats = { totalUsers: 0, essentialUsers: 0, premiumUsers: 0 };
  let products: any[] = [];
  let partners: any = { totalPartners: 0, activePartners: 0 };
  const recentClaims: any[] = [];

  try {
    const stats = await services.dashboard.getMembershipStats();
    // Map the response to our expected format - use type assertion for now
    const statsData = stats as any;
    membershipStats = {
      totalUsers: statsData.totalUsers || 0,
      essentialUsers: statsData.essentialUsers || 0,
      premiumUsers: statsData.premiumUsers || 0,
    };
  } catch (error) {
    console.error('Error fetching membership stats:', error);
  }

  try {
    const productResponse = await services.product.searchProducts({ limit: 6 });
    products = productResponse.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  try {
    partners = await services.partner.getPartnerDashboard();
  } catch (error) {
    console.error('Error fetching partners:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">GrabHealth AI Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membershipStats.totalUsers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Essential Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membershipStats.essentialUsers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Premium Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {membershipStats.premiumUsers || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="claims">Recent Claims</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video relative bg-gray-100">
                  <Image
                    src={
                      product.imageUrl ||
                      '/placeholder.svg?height=200&width=300'
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {product.description?.substring(0, 100)}...
                      </CardDescription>
                    </div>
                    <Badge variant={product.inStock ? 'default' : 'secondary'}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No products available at the moment.
            </p>
          )}
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Partner Network</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {partners.totalPartners || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {partners.activePartners || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  ${partners.totalEarnings || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recent Gift Claims</h2>
          {recentClaims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border">User</th>
                    <th className="text-left p-3 border">Gift</th>
                    <th className="text-left p-3 border">Partner</th>
                    <th className="text-left p-3 border">Claimed At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="border-b">
                      <td className="p-3 border">{claim.user_name}</td>
                      <td className="p-3 border">{claim.gift_name}</td>
                      <td className="p-3 border">{claim.partner_name}</td>
                      <td className="p-3 border">
                        {new Date(claim.claimed_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No recent gift claims found.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}