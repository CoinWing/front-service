"use client"

import { useEffect, useCallback } from "react"
import { useMarketStore } from "@/store/marketStore"
import { MarketInfo } from "@/types/market"

export default function MarketList() {
  const { markets, tickers, connect, isConnecting, error, ws } = useMarketStore();

  // connect 함수를 메모이제이션
  const handleConnect = useCallback(() => {
    if (!ws && !isConnecting) {
      connect();
    }
  }, [connect, ws, isConnecting]);

  useEffect(() => {
    // 컴포넌트 마운트 시에만 연결 시도
    handleConnect();
  }, [handleConnect]);

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

  // 연결 상태에 따른 UI 표시
  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div className="text-center text-gray-500"> 실제 거래소에서 실시간 데이터를 연동하고 있습니다.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-center text-gray-500"> 거래소와의 연동이 실패하였습니다. 새로고침해 주세요. </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen overflow-y-scroll">
      {markets.map((market) => (
        <div key={market.market} className="flex items-center py-3 border-b text-sm">
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
