import { OrderBook } from "@/components/OrderBook"

export default function OrderBookPage() {
  // 예시 데이터
  const bids = [
    { price: 65400, size: 0.5, total: 0.5 },
    { price: 65300, size: 1.2, total: 1.7 },
    { price: 65200, size: 0.8, total: 2.5 },
  ]
  const asks = [
    { price: 65500, size: 0.3, total: 0.3 },
    { price: 65600, size: 0.7, total: 1.0 },
    { price: 65700, size: 1.1, total: 2.1 },
  ]

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Order Book</h1>
      <div className="grid gap-8">
        <OrderBook symbol="BTC/USDT" bids={bids} asks={asks} />
      </div>
    </main>
  )
} 