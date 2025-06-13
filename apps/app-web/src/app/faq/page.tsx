import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Find answers to common questions about our products and services',
};

const faqs = [
  {
    question: 'How do I place an order?',
    answer:
      "To place an order, simply browse our products, add items to your cart, and proceed to checkout. You'll need to create an account or check out as a guest, enter your shipping and payment information, and confirm your order.",
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards, including Visa, Mastercard, American Express, and Discover. We also accept payments through PayPal and Apple Pay for your convenience.',
  },
  {
    question: 'How can I track my order?',
    answer:
      "Once your order has been shipped, you will receive a confirmation email with a tracking number. You can use this number to track your package on the carrier's website. You can also log in to your account to view your order status and tracking information.",
  },
  {
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day return policy for most items. Items must be unused, in their original packaging, and accompanied by proof of purchase. Some items, such as personal care products and prescription medications, may not be eligible for return. Please see our Returns & Refunds page for more details.',
  },
  {
    question: 'Do you ship internationally?',
    answer:
      'Yes, we ship to select international destinations. Additional customs fees, taxes, and duties may apply and are the responsibility of the recipient. Please note that delivery times may vary depending on the destination.',
  },
  {
    question: 'How can I contact customer service?',
    answer:
      'Our customer service team is available to assist you Monday through Friday, 9:00 AM to 5:00 PM EST. You can reach us by phone at 1-800-123-4567, by email at support@grabhealth.com, or through the contact form on our website.',
  },
  {
    question: 'Do you offer discounts for bulk orders?',
    answer:
      "Yes, we offer special pricing for bulk orders. Please contact our sales team at sales@grabhealth.com with details about the products and quantities you're interested in, and we'll provide you with a customized quote.",
  },
  {
    question: 'How do I update my account information?',
    answer:
      'You can update your account information at any time by logging in to your account and navigating to the Account Settings page. Here, you can update your personal information, shipping addresses, payment methods, and communication preferences.',
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Find answers to common questions about our products and services
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="mb-4">
            If you can't find the answer to your question in our FAQ, our
            customer service team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:18001234567"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-center hover:bg-emerald-700 transition-colors"
            >
              Call Us: (800) 123-4567
            </a>
            <a
              href="mailto:support@grabhealth.com"
              className="border border-gray-300 px-6 py-3 rounded-lg text-center hover:bg-gray-100 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
