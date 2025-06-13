import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds',
  description: 'Our return and refund policy',
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Hassle-free returns and refunds for your peace of mind
            </p>
          </div>
        </div>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
          <p className="mb-4">
            We want you to be completely satisfied with your purchase. If you're
            not satisfied, you may return most items within 30 days of delivery
            for a full refund.
          </p>
          <p className="mb-4">
            To be eligible for a return, your item must be unused, in the same
            condition that you received it, in its original packaging, and
            accompanied by the original receipt or proof of purchase.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            How to Initiate a Return
          </h2>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>Log in to your account and go to Order History</li>
            <li>Select the item(s) you wish to return</li>
            <li>Choose a reason for the return and submit your request</li>
            <li>Print the return label and packing slip</li>
            <li>Package the item(s) securely and attach the return label</li>
            <li>Drop off the package at your nearest shipping location</li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
          <p className="mb-4">
            Once we receive your return, we will inspect it and notify you that
            we've received your returned item. We will also notify you of the
            approval or rejection of your refund.
          </p>
          <p className="mb-4">
            If approved, your refund will be processed, and a credit will
            automatically be applied to your original method of payment within
            5-10 business days.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700">
              <strong>Note:</strong> Shipping costs are non-refundable. If you
              receive a refund, the cost of return shipping will be deducted
              from your refund.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
          <p className="mb-4">
            Certain items cannot be returned for health and safety reasons,
            including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Opened or used personal care items</li>
            <li>Prescription medications</li>
            <li>Perishable goods</li>
            <li>Personalized or custom-made products</li>
            <li>Items marked as final sale</li>
          </ul>
          <p>
            If you have any questions about our return policy, please contact
            our customer service team for assistance.
          </p>
        </section>
      </div>
    </div>
  );
}
