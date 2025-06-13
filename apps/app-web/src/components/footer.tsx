import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto px-3 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/Footer.svg"
                alt="GrabHealth AI Logo"
                width={120}
                height={50}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted health membership platform for exclusive benefits and
              discounts.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-emerald-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 md:mb-4">
              Customer Service
            </h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li>
                <Link
                  href="/orders"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Orders & Payment
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Shop By</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products/supplements"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Health Supplements
                </Link>
              </li>
              <li>
                <Link
                  href="/products/devices"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Medical Devices
                </Link>
              </li>
              <li>
                <Link
                  href="/products/personal-care"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Personal Care
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-gray-400 hover:text-emerald-400"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} GrabHealth AI. All Rights
              Reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                877 The Bronx, NY 10458, USA
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
