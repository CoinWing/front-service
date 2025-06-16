'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const hideHeader = pathname === '/login' || pathname === '/signup'

  if (hideHeader) return null;

  return (
    <nav className="border-b bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold hover:text-gray-300">
              CoWing
            </Link>
            <Link href="/orderbook" className="hover:text-gray-300">
              Order Book
            </Link>
            <Link href="/pricelist" className="hover:text-gray-300">
              Price List
            </Link>
          </div>

          {/* 오른쪽 */}
          <div className="flex items-center space-x-6">
            <Link href="/login" className="hover:text-gray-300">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-gray-300">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
