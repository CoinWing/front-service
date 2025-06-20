import { useEffect, useState, useCallback } from "react"
import { useMarketStore } from "@/store/marketStore"

export default function GeneralAskingPrice() {
  const { orderbooks, tickers, selectedMarket, connect, tradeData, isConnecting, error, isLoading, ws } = useMarketStore();
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // connect 함수를 메모이제이션
  const handleConnect = useCallback(() => {
    if (!ws && !isConnecting) {
      connect();
    }
  }, [connect, ws, isConnecting]);

  useEffect(() => {
    // 초기 데이터가 로드되었는지 확인
    if (Object.keys(tickers).length > 0 && Object.keys(orderbooks).length > 0) {
      setIsInitialDataLoaded(true);
    }
  }, [tickers, orderbooks]);

  useEffect(() => {
    // 컴포넌트 마운트 시에만 연결 시도
    handleConnect();
  }, [handleConnect]);

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
  

  // WebSocket 연결 중
  if (isConnecting && isInitialDataLoaded) {
    return (
      <div className="bg-white h-full flex flex-col">
        {/* 연결 상태 표시 바 */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">실시간 데이터 연결 중...</span>
            </div>
            <span className="text-xs text-blue-600">초기 데이터 표시 중</span>
          </div>
        </div>
        
        {/* 기존 데이터 표시 */}
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
    );
  }

  // 연결 에러
  if (error) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">연결 오류</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button 
            onClick={() => connect()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            재연결 시도
          </button>
        </div>
      </div>
    );
  }

  // 실시간 연결 상태 표시 (WebSocket이 연결된 경우)
  const showRealtimeIndicator = ws?.readyState === WebSocket.OPEN;
  
  return (
    <div className="bg-white h-full flex flex-col">
      {/* 실시간 상태 표시 바 */}
      {showRealtimeIndicator && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-green-700">실시간 데이터 연결됨</span>
            </div>
            <span className="text-xs text-green-600">실시간 업데이트 중</span>
          </div>
        </div>
      )}
      
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
