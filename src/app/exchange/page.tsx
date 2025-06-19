"use client"

import SearchBar from "@/components/search-bar"
import MarketTabs from "@/components/market-tabs"
import MarketSortBar from "@/components/market-sort-bar"
import MarketList from "@/components/market-list"
import TradeForm from "@/components/trade-form"
import CryptoSummary from "@/components/crypto-summary"
import OrderBookView from "@/components/order-book-view"
import CandleChart from "@/components/CandleChart"

export default function ExchangePage() {
  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8">
      {/* Left section - 2/3 width */}
      <div className="col-span-2 flex flex-col gap-2">
        {/* Bitcoin Trading Section - Full width */}
        <div className="border rounded-md overflow-hidden">
          <CryptoSummary />
        </div>
        <div className="mx-auto grid grid-cols-2 gap-2">
          <div className="border rounded-md overflow-hidden">
            <CandleChart />
          </div>
        </div>
        {/* Order Book and Trade Form Section - Split into two columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-md overflow-hidden">
            <OrderBookView />
          </div>
          <div className="border rounded-md overflow-hidden">
            <TradeForm />
          </div>
        </div>
      </div>

      {/* Right section - 1/3 width */}
      <div className="col-span-1 flex flex-col gap-2">
        <SearchBar />
        <div className="border rounded-md overflow-hidden flex-1">
          <MarketTabs />
          <MarketSortBar />
          <MarketList />
        </div>
      </div>
    </main>
  )
}
