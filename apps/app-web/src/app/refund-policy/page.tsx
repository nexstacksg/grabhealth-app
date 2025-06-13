import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Our policy on returns, refunds, and exchanges.',
};

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Refund Policy
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Our policy on returns, refunds, and exchanges
            </p>
          </div>
        </div>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Returns & Exchanges
          </h2>
          <p className="mb-4">
            We accept returns and exchanges within 30 days of the original
            purchase date. To be eligible for a return, your item must be
            unused, in the same condition that you received it, and in its
            original packaging.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Refunds</h2>
          <p className="mb-4">
            Once we receive your return, we will inspect it and notify you that
            we've received your returned item. We will immediately notify you on
            the status of your refund after inspecting the item.
          </p>
          <p className="mb-4">
            If your return is approved, we will initiate a refund to your
            original method of payment. You will receive the credit within a
            certain amount of days, depending on your card issuer's policies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Non-Refundable Items
          </h2>
          <p className="mb-4">The following items cannot be returned:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Gift cards</li>
            <li>Downloadable software products</li>
            <li>Personalized or custom-made products</li>
            <li>Products marked as final sale</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Return Shipping</h2>
          <p className="mb-4">
            Customers are responsible for return shipping costs. We recommend
            using a trackable shipping service and purchasing shipping
            insurance.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Damaged or Defective Items
          </h2>
          <p className="mb-4">
            If you receive a damaged or defective item, please contact us within
            7 days of delivery. We'll provide a prepaid return label and process
            a replacement or refund once we receive the returned item.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. How to Initiate a Return
          </h2>
          <p className="mb-4">
            To initiate a return, please contact our customer service team at
            support@grabhealth.com with your order number and details about the
            product you'd like to return.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about our refund policy, please contact us
            at support@grabhealth.com.
          </p>
        </section>
      </div>
    </div>
  );
}
