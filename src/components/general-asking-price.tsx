import { useEffect, useState, useCallback } from "react"
import { useMarketStore } from "@/store/marketStore"

export default function GeneralAskingPrice() {
  const { orderbooks, tickers, selectedMarket, tradeData, error, isLoading } = useMarketStore();
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  useEffect(() => {
    // 초기 데이터가 로드되었는지 확인
    if (Object.keys(tickers).length > 0 && Object.keys(orderbooks).length > 0) {
      setIsInitialDataLoaded(true);
    }
  }, [tickers, orderbooks]);

  const orderbook = orderbooks[selectedMarket];
  const ticker = tickers[selectedMarket];
  const asks = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  const bids = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  const change = ticker ? ((ticker.signed_change_rate || 0) * 100).toFixed(2) + "%" : "0.00%";
  const trades = tradeData?.[selectedMarket] ?? [];
  
  // 체결강도 계산
  const tradeStrength = ticker ? ((ticker.acc_bid_volume || 0) / (ticker.acc_ask_volume || 1) * 100).toFixed(2) : '0.00';
  
  // 거래량: 정수, 거래대금: 백만원 단위(소수점 2자리)
  const formattedVolume = ticker ? Math.floor(ticker.acc_trade_volume_24h || 0).toLocaleString() : '0';
  const formattedPrice = ticker ? ((ticker.acc_trade_price_24h || 0) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';

  if (isLoading && !isInitialDataLoaded) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  // 연결 에러
  if (error) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">연결 오류</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white h-full flex flex-col">
      {/* 주문 영역 (본문) */}
      <div className="grid grid-cols-3 grid-rows-60">
        {/* 매도호가 영역 */}
        <div className="col-span-2 row-span-30">
          <div className="flex-1">
            {asks.slice().reverse().map((item, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-2 items-center h-8 px-3 text-sm border-b border-gray-100 hover:bg-gray-100 bg-blue-50`}
                >
                  <div className="text-gray-700 text-right font-medium pr-2">{(item.ask_size || 0).toLocaleString()}</div>
                  <div className="flex items-center gap-x-4 justify-center">
                    <span className="text-red-600 font-bold">{(item.ask_price || 0).toLocaleString()}</span>
                    <span className="text-red-600 font-medium">{change}</span>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 거래 정보 영역 */}
        <div className="col-span-1 row-span-30">
          <div className="bg-gray-50 p-4 h-full flex flex-col justify-end">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm leading-tight">거래량<br />(24H)</span>
                <div className="text-right">
                  <div className="font-bold">{formattedVolume}</div>
                  <div className="text-xs text-gray-500">{selectedMarket.split('-')[1]}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm leading-tight">거래대금<br />(24H)</span>
                <div className="text-right">
                  <div className="font-bold">{formattedPrice}</div>
                  <div className="text-xs text-gray-500">백만원</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">고가</span>
                <div className="text-right">
                  <div className="font-bold text-red-600">{ticker ? (ticker.high_price || 0).toLocaleString() : '0'}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">저가</span>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{ticker ? (ticker.low_price || 0).toLocaleString() : '0'}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">전일종가</span>
                <div className="font-bold">{ticker ? (ticker.prev_closing_price || 0).toLocaleString() : '0'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 체결 정보 영역 */}
        <div className="col-span-1 row-span-30">
          <div className="flex justify-center p-2">
            <div className="text-sm">
              <span className="text-gray-600">체결강도</span>
              <span className="ml-2 font-bold">+{tradeStrength}%</span>
            </div>
          </div>
          <div className="bg-gray-100 flex text-xs text-gray-600 mb-2 font-medium p-3">
            <div className="flex-1 text-center">체결가</div>
            <div className="flex-1 text-center">체결액(KRW)</div>
          </div>
          <div className="h-96 overflow-y-hidden">
            {trades.map((item, index) => (
              <div key={index} className="flex items-center py-1 text-xs hover:bg-gray-100">
                <div className={`w-28 pr-4 text-center font-medium text-black-500`}>{(item.trade_price || 0).toLocaleString()}</div>
                <div className={`flex-1 text-right font-medium pr-4 ${item.ask_bid === 'ASK' ? 'text-blue-600' : 'text-red-600'}`}>
                  {Math.floor((item.trade_price || 0) * (item.trade_volume || 0)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 매수호가 영역 */}
        <div className="col-span-2 row-span-30">
          <div className="flex-1">
            {bids.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 items-center h-8 px-3 text-sm border-b border-gray-100 hover:bg-gray-100 bg-red-50"
                >
                  <div className="flex items-center gap-x-4 justify-center">
                    <span className="text-red-600 font-bold">{(item.bid_price || 0).toLocaleString()}</span>
                    <span className="text-red-600 font-medium pr-6">{change}</span>
                  </div>
                  <div className="text-gray-700 text-left font-medium pl-2">{(item.bid_size || 0).toLocaleString()}</div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
