import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Information about our shipping methods and delivery times.',
};

export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Shipping Policy
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Fast and reliable shipping options
            </p>
          </div>
        </div>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Processing Time</h2>
          <p className="mb-4">
            Orders are typically processed within 1-2 business days. Processing
            time may be longer during peak seasons or promotional periods.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Shipping Methods</h2>
          <div className="mb-4">
            <h3 className="text-xl font-medium mb-2">Standard Shipping</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>3-5 business days</li>
              <li>Free on orders over $50</li>
              <li>$4.99 for orders under $50</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-medium mb-2">Express Shipping</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>1-2 business days</li>
              <li>$9.99 flat rate</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. International Shipping
          </h2>
          <p className="mb-4">
            We currently ship to select countries. International orders may be
            subject to customs fees and import duties which are the
            responsibility of the customer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Order Tracking</h2>
          <p className="mb-4">
            You will receive a shipping confirmation email with tracking
            information once your order has been shipped. Please allow up to 24
            hours for tracking information to update.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Shipping Restrictions
          </h2>
          <p className="mb-4">
            Some items may have shipping restrictions based on your location.
            We'll notify you if any items in your order cannot be shipped to
            your address.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about our shipping policy, please contact
            us at support@grabhealth.com.
          </p>
        </section>
      </div>
    </div>
  );
}
