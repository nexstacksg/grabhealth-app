import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our services.',
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 md:p-10 text-white shadow-lg mb-6 border border-emerald-700">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto">
              Last updated: May 20, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="prose max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="mb-4">
            By accessing or using our website and services, you agree to be
            bound by these Terms of Service and our Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Account Registration
          </h2>
          <p className="mb-4">
            To access certain features, you may need to create an account. You
            are responsible for maintaining the confidentiality of your account
            credentials.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Product Information
          </h2>
          <p className="mb-4">
            We make every effort to display our products as accurately as
            possible. However, we cannot guarantee that your device's display
            will be accurate.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Pricing and Payment
          </h2>
          <p className="mb-4">
            All prices are in USD. We reserve the right to change prices at any
            time. Payment must be made at the time of purchase.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Limitation of Liability
          </h2>
          <p className="mb-4">
            To the fullest extent permitted by law, we shall not be liable for
            any indirect, incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            support@grabhealth.com.
          </p>
        </section>
      </div>
    </div>
  );
}
