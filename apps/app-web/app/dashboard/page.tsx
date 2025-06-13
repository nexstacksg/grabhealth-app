import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { neon } from '@neondatabase/serverless';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);

// Dashboard page component
export default async function DashboardPage() {
  // Fetch data from database
  const membershipStats = await getMembershipStats();
  const products = await getProducts();
  const partners = await getPartners();
  const recentClaims = await getRecentClaims();

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
              {membershipStats.totalUsers}
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
              {membershipStats.essentialUsers}
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
              {membershipStats.premiumUsers}
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
                      product.image_url ||
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
                      <Badge className="mb-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                        {product.category_name}
                      </Badge>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${Number.parseFloat(product.price).toFixed(2)}
                      </div>
                      <div className="text-sm text-emerald-600">
                        Premium: $
                        {(
                          Number.parseFloat(product.price) *
                          (1 - Number.parseFloat(product.discount_premium))
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Partner Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  <CardTitle>{partner.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{partner.address}</p>
                  <div className="text-sm text-gray-500">
                    <span>Lat: {partner.latitude}</span>
                    <span className="mx-2">|</span>
                    <span>Long: {partner.longitude}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recent Gift Claims</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Data fetching functions
async function getMembershipStats() {
  const totalUsers = await sql`SELECT COUNT(*) as count FROM users`;
  const essentialUsers = await sql`
    SELECT COUNT(*) as count 
    FROM user_memberships um 
    JOIN membership_tiers mt ON um.tier_id = mt.id 
    WHERE mt.name = 'Essential'
  `;
  const premiumUsers = await sql`
    SELECT COUNT(*) as count 
    FROM user_memberships um 
    JOIN membership_tiers mt ON um.tier_id = mt.id 
    WHERE mt.name = 'Premium'
  `;

  return {
    totalUsers: Number.parseInt(totalUsers[0].count),
    essentialUsers: Number.parseInt(essentialUsers[0].count),
    premiumUsers: Number.parseInt(premiumUsers[0].count),
  };
}

async function getProducts() {
  const products = await sql`
    SELECT p.*, pc.name as category_name 
    FROM products p
    JOIN product_categories pc ON p.category_id = pc.id
    ORDER BY p.name
  `;
  return products;
}

async function getPartners() {
  const partners = await sql`
    SELECT * FROM partners
    ORDER BY name
  `;
  return partners;
}

async function getRecentClaims() {
  const claims = await sql`
    SELECT 
      gc.id,
      gc.claimed_at,
      u.name as user_name,
      gi.name as gift_name,
      p.name as partner_name
    FROM gift_claims gc
    JOIN users u ON gc.user_id = u.id
    JOIN gift_items gi ON gc.gift_id = gi.id
    JOIN partners p ON gc.partner_id = p.id
    ORDER BY gc.claimed_at DESC
    LIMIT 10
  `;
  return claims;
}
