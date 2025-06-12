import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery',
  description: 'Information about our shipping and delivery policies',
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Shipping & Delivery</h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Fast, reliable delivery options to get your health products when you need them
            </p>
          </div>
        </div>
      </div>
      
      <div className="prose max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <p className="mb-4">
            We strive to process and ship all orders within 1-2 business days. Once your order has been shipped, you will receive a confirmation email with tracking information.
          </p>
          <p className="mb-4">
            Please ensure your shipping address is correct at the time of placing your order, as we cannot modify the shipping address once the order has been processed.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Delivery Times</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Standard Shipping: 3-7 business days</li>
            <li>Express Shipping: 1-3 business days</li>
            <li>Same-day Delivery: Available in select areas</li>
          </ul>
          <p>
            Delivery times are estimates and may be affected by factors outside our control, such as weather conditions or carrier delays.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Shipping Rates</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Delivery Time</th>
                  <th className="text-left py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Standard Shipping</td>
                  <td>3-7 business days</td>
                  <td>$5.99</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Express Shipping</td>
                  <td>1-3 business days</td>
                  <td>$12.99</td>
                </tr>
                <tr>
                  <td className="py-3">Free Shipping</td>
                  <td>3-7 business days</td>
                  <td>Free on orders over $50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">International Shipping</h2>
          <p className="mb-4">
            We currently ship to select international destinations. Additional customs fees, taxes, and duties may apply upon delivery and are the responsibility of the recipient.
          </p>
          <p>
            For more information about our international shipping policies, please contact our customer service team.
          </p>
        </section>
      </div>
    </div>
  );
}
