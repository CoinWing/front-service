"use client"

import { useEffect, useState } from "react"
import { useMarketStore } from "@/store/marketStore"
import { ChevronDown, Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const formatVolume = (volume: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(volume);
};

const formatChangeRate = (rate: number) => {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(rate * 100);
};

// 티커에서 심볼 추출 (앞 3글자)
const getSymbolFromTicker = (ticker: string) => {
  return ticker.split('-')[1].slice(0, 3).toUpperCase();
};

export default function CryptoSummary() {
  const { 
    tickers, 
    selectedMarket, 
    isLoading, 
    error,
    connect,
    disconnect,
    setSelectedMarket,
    markets,
    initializeMarkets
  } = useMarketStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('Component mounted, connecting to WebSocket...');
    initializeMarkets();
    connect();
    return () => {
      console.log('Component unmounting, disconnecting from WebSocket...');
      disconnect();
    };
  }, [connect, disconnect, initializeMarkets]);

  useEffect(() => {
    console.log('Current tickers:', tickers);
    console.log('Selected market:', selectedMarket);
  }, [tickers, selectedMarket]);

  const ticker = tickers[selectedMarket];
  const selectedMarketInfo = markets.find(m => m.market === selectedMarket);

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="text-center text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="text-center text-red-500">
          <p>연결 오류가 발생했습니다.</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={connect}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            재연결 시도
          </button>
        </div>
      </div>
    );
  }

  if (!ticker) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="text-center text-gray-500">
          <p>데이터가 없습니다.</p>
          <p className="text-sm mt-2">선택된 마켓: {selectedMarket}</p>
          <button 
            onClick={connect}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            재연결 시도
          </button>
        </div>
      </div>
    );
  }

  const isPriceUp = ticker.signed_change_rate > 0;
  const priceColor = isPriceUp ? 'text-red-600' : 'text-blue-600';
  const changeIcon = isPriceUp ? '▲' : '▼';

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border rounded-md shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#F7931A] text-white rounded-full">
            <span className="font-bold">{getSymbolFromTicker(selectedMarket)}</span>
          </div>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded">
              <span className="font-medium text-gray-800">
                {selectedMarketInfo?.korean_name} {selectedMarket}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              {markets.map((market) => (
                <DropdownMenuItem
                  key={market.market}
                  onClick={() => {
                    setSelectedMarket(market.market);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-[#F7931A] text-white rounded-full text-sm">
                    {getSymbolFromTicker(market.market)}
                  </div>
                  <div>
                    <div className="font-medium">{market.korean_name}</div>
                    <div className="text-sm text-gray-500">{market.market}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center">
          <Tabs defaultValue="price" className="w-auto">
            <TabsList className="bg-transparent p-0">
              <TabsTrigger
                value="price"
                className="px-6 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                시세
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="px-6 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                정보
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <button className="ml-4 p-2">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Price section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex flex-col">
              <div className="flex items-baseline">
                <h1 className={`text-4xl font-bold ${priceColor}`}>
                  {formatPrice(ticker.trade_price)}
                </h1>
                <span className="ml-1 text-gray-500">KRW</span>
              </div>
              <div className={`flex items-center mt-1 ${priceColor}`}>
                <span className="font-medium">
                  {formatChangeRate(ticker.signed_change_rate)}%
                </span>
                <span className="mx-1">{changeIcon}</span>
                <span className="font-medium">
                  {formatPrice(ticker.signed_change_price)}
                </span>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="col-span-1 md:col-span-2">
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center">
                  <span className="text-gray-600">고가</span>
                  <span className=" font-bold text-red-600 whitespace-nowrap ml-2">{formatPrice(ticker.high_price)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 whitespace-nowrap">거래량(24H)</span>
                  <span className="font-small whitespace-nowrap pl-2">{formatVolume(ticker.acc_trade_volume_24h)} <span className="tetext-gray-500">{selectedMarket.split('-')[1]}</span></span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center">
                  <span className="text-gray-600">저가</span>
                  <span className="font-small font-bold text-blue-600 whitespace-nowrap ml-2">{formatPrice(ticker.low_price)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 whitespace-nowrap">거래대금(24H)</span>
                  <span className="font-small whitespace-nowrap pl-2">{formatPrice(ticker.acc_trade_price_24h)} <span className="text-sm text-gray-500">KRW</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
