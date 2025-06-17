import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "Real-time cryptocurrency trading platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  Crypto Trading
                </Link>
                <div className="flex gap-4">
                  <Link href="/orderbook" className="hover:text-primary">
                    Order Book
                  </Link>
                  <Link href="/pricelist" className="hover:text-primary">
                    Price List
                  </Link>
                  <Link href="/pricelist" className="hover:text-primary">
                    Chart
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
} 