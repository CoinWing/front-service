import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import WebSocketProvider from "@/providers/WebSocketProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "코윙 - 코인 모의투자 서비스",
  description: "코윙을 사용하면 경제적 손실없이 리스크 관리 등 경제적 관념을 향상할 수 있습니다.",
  icons: {
    icon: "/cowing.png",
  },
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
          <Header />
          <WebSocketProvider>
            <div className="pt-10">
              {children}
            </div>
          </WebSocketProvider>
        </div>
      </body>
    </html>
  )
}
