import { redirect } from 'next/navigation';
import { serverApiGet } from '@/lib/server-api';
import CommissionPageClient from './commission-page-client';

// Force dynamic rendering since we're using cookies
export const dynamic = 'force-dynamic';

async function getUserAndCommissionData() {
  // Get user data with proper Strapi populate syntax
  const userResult = await serverApiGet('/users/me?populate[upline]=*&populate[downlines]=*');
  
  if (!userResult.success) {
    // If not authenticated, redirect to login
    if (userResult.error?.includes('Not authenticated')) {
      redirect('/auth/login?redirect=/commission');
    }
    
    // For other errors, return null or handle as needed
    console.error('Failed to get user:', userResult.error);
    return null;
  }

  const user = userResult.data;

  // Get commission data, products, and achievement rewards in parallel
  try {
    const [commissionResult, productsResult, achievementResult] = await Promise.all([
      serverApiGet(
        `/commission-calculations?filters[beneficiary][documentId][$eq]=${user.documentId || user.id}&populate[order]=true&populate[appliedTemplate]=true&sort=createdAt:desc&pagination[pageSize]=50`
      ),
      serverApiGet(
        `/products?populate[0]=commissionTemplate&populate[1]=commissionTemplate.details&populate[2]=category&pagination[pageSize]=100`
      ),
      serverApiGet(
        `/achievement-rewards?filters[achievementStatus][$eq]=active&sort=criteriaValue:asc`
      )
    ]);

    // Log the results for debugging
    if (!productsResult.success) {
      console.error('Failed to fetch products:', productsResult.error);
    } else {
      console.log('Products API response:', productsResult.data);
    }
    
    return {
      user,
      commissions: commissionResult.success ? (commissionResult.data?.data || commissionResult.data || []) : [],
      products: productsResult.success ? (productsResult.data?.data || productsResult.data || []) : [],
      achievements: achievementResult.success ? (achievementResult.data?.data || achievementResult.data || []) : []
    };
  } catch (error) {
    console.error('Error fetching commission data:', error);
    return {
      user,
      commissions: [],
      products: [],
      achievements: []
    };
  }
}

export default async function CommissionPage() {
  const data = await getUserAndCommissionData();

  // If no user data, redirect to login (this is a fallback, normally handled in getUser)
  if (!data) {
    redirect('/auth/login?redirect=/commission');
  }

  const { user, commissions, products, achievements } = data;
  
  // Process commission data - ensure commissions is an array
  const commissionsArray = Array.isArray(commissions) ? commissions : [];
  const processedCommissions = commissionsArray.map((c: any) => ({
    id: parseInt(c.id || '0'),
    documentId: c.documentId || c.id?.toString() || '',
    orderId: parseInt(c.order?.id || '0'),
    userId: (c.beneficiary?.id || '').toString(),
    recipientId: (c.beneficiary?.id || '').toString(),
    amount: parseFloat(c.commissionAmount || 0),
    commissionRate: parseFloat(c.commissionRate || 0),
    relationshipLevel: parseInt(c.commissionLevel || 0),
    type: c.commissionType === 'percentage' ? 'PERCENTAGE' : 'FIXED',
    status: c.calculationStatus?.toUpperCase() || 'PENDING',
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));
  
  const totalEarnings = processedCommissions.reduce((sum: number, c: any) => sum + c.amount, 0);
  const referralLink = user?.referralCode || user?.documentId || user?.id || '';

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 mb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your multi-level commission network and track your earnings
        </p>
      </div>

      <CommissionPageClient 
        user={user}
        processedCommissions={processedCommissions}
        totalEarnings={totalEarnings}
        referralLink={referralLink}
        products={products}
        achievements={achievements}
      />
    </div>
  );
}