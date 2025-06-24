"use client"

import { Suspense } from "react"
import { useEffect } from "react"
import { useMarketStore } from "@/store/marketStore"
import SearchBar from "@/components/SearchBar"
import MarketTabs from "@/components/MarketTabs"
import MarketSortBar from "@/components/MarketSortBar"
import MarketList from "@/components/MarketList"
import TradeForm from "@/components/TradeForm"
import CryptoSummary from "@/components/CryptoSummary"
import OrderBookView from "@/components/OrderBookView"
import CandleChart from "@/components/CandleChart"

// useSearchParams를 사용하는 컴포넌트들을 별도로 분리
function ExchangeContent() {
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
  // 클라이언트 사이드에서 저장된 마켓 복원 (hydration 후 실행)
  useEffect(() => {
    restoreSelectedMarket();
  }, [restoreSelectedMarket]);

  // URL 파라미터에서 마켓 정보 읽기 및 초기 설정
  useEffect(() => {
    const marketFromUrl = searchParams.get('market');
    if (marketFromUrl && markets.length > 0) {
      // 유효한 마켓인지 확인
      const isValidMarket = markets.some(m => m.market === marketFromUrl);
      if (isValidMarket && selectedMarket !== marketFromUrl) {
        setSelectedMarket(marketFromUrl);
      }
    }
  }, [searchParams, markets, selectedMarket, setSelectedMarket]);

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

// 로딩 컴포넌트
function ExchangeLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function ExchangePage() {
  return (
    <Suspense fallback={<ExchangeLoading />}>
      <ExchangeContent />
    </Suspense>
  );
}
