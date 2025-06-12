import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn about our privacy practices and how we protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Last updated: May 20, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, such as when you create an account, place an order, or contact us. This may include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your name, email address, and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely by our payment processor)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your account and orders</li>
            <li>Improve our products and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Access and receive a copy of your personal data</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@grabhealth.com.
          </p>
        </section>
      </div>
    </div>
  );
}
