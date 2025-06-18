'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketStore } from '@/store/marketStore'

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

interface Order {
  price: number
  size: number
  total: number
}

interface OrderBookProps {
  symbol: string
  bids: Order[]
  asks: Order[]
}

export function OrderBook({ symbol, bids, asks }: OrderBookProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{symbol} Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Bids</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right text-green-500">${bid.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{bid.size.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{bid.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Asks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asks.map((ask, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-right text-red-500">${ask.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ask.size.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{ask.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const Orderbook = () => {
  const { 
    orderbooks, 
    selectedMarket, 
    isLoading, 
    error,
    currentPrice,
    connect,
    disconnect,
    setSelectedMarket 
  } = useMarketStore()

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const orderbook = orderbooks[selectedMarket]
  const orderbookUnits = orderbook?.orderbook_units || []

  if (isLoading) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        호가 데이터를 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>연결 오류가 발생했습니다.</p>
            <p className="text-sm mt-2">{error}</p>
            <button 
              onClick={connect}
              className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              재연결 시도
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4">
        <Select value={selectedMarket} onValueChange={setSelectedMarket}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="마켓 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KRW-BTC">비트코인 (BTC)</SelectItem>
            <SelectItem value="KRW-ETH">이더리움 (ETH)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedMarket} Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Bids</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderbookUnits.slice(0, 10).map((unit, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-right text-green-500">
                        {formatPrice(unit.bid_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(unit.bid_size)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Asks</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderbookUnits.slice(0, 10).map((unit, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-right text-red-500">
                        {formatPrice(unit.ask_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(unit.ask_size)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 