"use client"

import { useEffect } from "react"
import { useMarketStore } from "@/store/marketStore"
import { useSearchParams } from 'next/navigation'
import SearchBar from "@/components/search-bar"
import MarketTabs from "@/components/market-tabs"
import MarketSortBar from "@/components/market-sort-bar"
import MarketList from "@/components/market-list"
import TradeForm from "@/components/trade-form"
import CryptoSummary from "@/components/crypto-summary"
import OrderBookView from "@/components/order-book-view"
import CandleChart from "@/components/CandleChart"

export default function ExchangePage() {
  const { setSelectedMarket } = useMarketStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { connect, ws, isConnecting } = useMarketStore.getState();
    if (!ws && !isConnecting) {
      connect();
    }

    return () => {
      const { disconnect } = useMarketStore.getState();
      disconnect();
    };
  }, []);

  useEffect(() => {
    const market = searchParams.get('market');
    if (market) {
      setSelectedMarket(market);
    }
  }, [searchParams, setSelectedMarket]);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Left section - 2/3 width (2 columns) */}
      <div className="col-span-2 flex flex-col gap-2">
        {/* Bitcoin Trading Section - Full width */}
        <div className="border rounded-md overflow-hidden bg-white">
          <CryptoSummary />
        </div>
        <div className="flex-1 border rounded-md overflow-hidden bg-white">
          <CandleChart />
        </div>
        {/* Order Book and Trade Form Section - Split into two columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-md overflow-hidden bg-white">
            <OrderBookView />
          </div>
          <div className="border rounded-md overflow-hidden bg-white">
            <TradeForm />
          </div>
        </div>
      </div>

      {/* Right section - 1/3 width (1 column) */}
      <div className="relative col-span-1">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col gap-2">
          {/* Non-scrolling part */}
          <div className="flex-shrink-0">
            <SearchBar />
            <div className="mt-2 rounded-t-md border-x border-t bg-white">
              <MarketTabs />
              <MarketSortBar />
            </div>
          </div>

          {/* Scrolling part */}
          <div className="flex-1 rounded-b-md border-x border-b bg-white overflow-y-auto">
            <MarketList />
          </div>
        </div>
      </div>
    </main>
  )
}
