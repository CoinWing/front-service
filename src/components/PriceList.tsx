'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMarketStore } from '@/store/marketStore'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const getMarketName = (market: string) => {
  const marketMap: { [key: string]: string } = {
    'KRW-BTC': '비트코인',
    'KRW-ETH': '이더리움'
  }
  return marketMap[market] || market
}

interface Price {
  symbol: string
  price: number
  change24h: number
}

const mockPrices: Price[] = [
  { symbol: "BTC/USDT", price: 65432.10, change24h: 2.5 },
  { symbol: "ETH/USDT", price: 3456.78, change24h: -1.2 },
  { symbol: "BNB/USDT", price: 567.89, change24h: 0.8 },
]

export function PriceList() {
  const { orderbooks, isLoading, error } = useMarketStore()

  const markets = ['KRW-BTC', 'KRW-ETH']

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPrices.map((price) => (
              <TableRow key={price.symbol}>
                <TableCell className="font-medium">{price.symbol}</TableCell>
                <TableCell className="text-right">${price.price.toLocaleString()}</TableCell>
                <TableCell className={`text-right ${price.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {price.change24h > 0 ? '+' : ''}{price.change24h}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 