"use client"

import { useMarketStore } from "@/store/marketStore"
import { MarketInfo } from "@/types/market"

export default function MarketList() {
  const { markets, tickers, error, isLoading, selectedMarket, setSelectedMarket } = useMarketStore();

  // 현재가 표시 및 전일 대비 거래량(24H)용 함수
  const currentAndChangePriceFormat = (beforeNumber: number) => {
    const value = beforeNumber || 0;
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // 거래대금(24H) 표시 함수
  const price24hFormat = (price: number) => {
    const value = price || 0;
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value / 1_000_000);
  };

  // 전일대비 비율 표시 함수
  const changeRateFormat = (rate: number) => {
    const value = rate || 0;
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value * 100);
  };

  // 전일대비 비율 색상 표시 함수
  const changeRatePriceColor = (market: MarketInfo) => {
    const changeRate = tickers[market.market]?.signed_change_rate || 0;
    const isPriceUp = changeRate > 0;
    return isPriceUp ? 'text-red-600' : 'text-blue-600';
  };

  // 마켓 선택 핸들러
  const handleMarketSelect = async (market: string) => {
    await setSelectedMarket(market);
  };

  if (isLoading && markets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">연결 오류</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="">
      {markets.map((market) => (
        <div 
          key={market.market} 
          onClick={() => handleMarketSelect(market.market)}
          className={`flex items-center py-3 border-b text-sm cursor-pointer hover:bg-gray-100 ${selectedMarket === market.market ? 'bg-blue-50' : ''}`}
        >
          <div className="flex-1 flex items-center px-2">
            <div className="flex flex-col">
              {/* 코인 이름 및 티커 표시 */}
              <div className="font-medium flex items-center">{market.korean_name}</div>
              <div className="text-gray-500 text-xs">{market.market}</div>
            </div>
          </div>
          {/* 현재가 표시 */}
          <div className="flex-1 text-right px-2">
            <div className={`${changeRatePriceColor(market)}`}>{currentAndChangePriceFormat(tickers[market.market]?.trade_price)}</div>
          </div>  
          {/* 전일대비 거래량(24H) */}
          <div className="flex-1 text-right px-2">
            <div className="flex flex-col">
              <div className={`${changeRatePriceColor(market)}`}>{changeRateFormat(tickers[market.market]?.signed_change_rate)}%</div>
              <div className={`${changeRatePriceColor(market)}`}>{currentAndChangePriceFormat(tickers[market.market]?.signed_change_price)}</div>
            </div>
          </div>
          {/* 거래 대금(24H) */}
          <div className="flex-1 text-right px-2">
            <div>{price24hFormat(tickers[market.market]?.acc_trade_price_24h)}
              <span className="text-xs text-gray-500">백만</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
