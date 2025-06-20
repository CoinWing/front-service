"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useMarketStore } from "@/store/marketStore"
import { Settings } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { 
    tickers, 
    selectedMarket, 
    isLoading, 
    error,
    connect,
    disconnect,
    setSelectedMarket,
    markets,
    initializeMarkets,
    loadInitialTickers
  } = useMarketStore();

  // URL 파라미터에서 마켓 정보 읽기
  useEffect(() => {
    const marketFromUrl = searchParams.get('market')
    if (marketFromUrl && markets.length > 0) {
      // 유효한 마켓인지 확인
      const isValidMarket = markets.some(m => m.market === marketFromUrl)
      if (isValidMarket) {
        setSelectedMarket(marketFromUrl)
      } else {
        // 유효하지 않은 마켓인 경우 기본값으로 리다이렉트
        router.replace('/exchange?market=KRW-BTC')
      }
    } else if (!marketFromUrl && markets.length > 0) {
      // URL 파라미터가 없는 경우 기본값으로 설정
      router.replace('/exchange?market=KRW-BTC')
    }
  }, [searchParams, markets, setSelectedMarket, router])

  useEffect(() => {
    console.log('Component mounted, initializing...');
    
    const initialize = async () => {
      try {
        // 마켓 정보 초기화
        await initializeMarkets();
        // 초기 시세 데이터 로드
        await loadInitialTickers();
        // WebSocket 연결
        await connect();
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    initialize();

    return () => {
      console.log('Component unmounting, disconnecting from WebSocket...');
      disconnect();
    };
  }, [connect, disconnect, initializeMarkets, loadInitialTickers]);

  const ticker = tickers[selectedMarket];
  const selectedMarketInfo = markets.find(m => m.market === selectedMarket);

  if (isLoading) {
    return (
      <div className="w-full max-w-10xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div className="text-center text-gray-500">잠시만 기다려주세요! 실제 거래소에서 실시간 데이터를 연동하고 있습니다.</div>
      </div>
    );
  }

  if (!ticker) {
    return (
      <div className="w-full max-w-10xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div className="text-center text-gray-500">'{selectedMarket}' 정보를 불러오고 있어요!</div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-10xl mx-auto bg-white border rounded-md shadow p-4">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-center text-gray-500"> 거래소와의 연동이 실패하였습니다. 새로고침해 주세요. </div>
        </div>
      </div>
    );
  }

  const isPriceUp = ticker.signed_change_rate > 0;
  const priceColor = isPriceUp ? 'text-red-600' : 'text-blue-600';
  const changeIcon = isPriceUp ? '▲' : '▼';

  return (
    <div className="w-full max-w-10xl mx-auto bg-white border rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#F7931A] text-white rounded-full">
            <span className="font-bold">{getSymbolFromTicker(selectedMarket)}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="font-medium text-gray-800">
              {selectedMarketInfo?.korean_name} {selectedMarket}
            </span>
          </div>
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
