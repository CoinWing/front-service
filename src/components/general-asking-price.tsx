import { useEffect } from "react"
import { useMarketStore } from "@/store/marketStore"

export default function GeneralAskingPrice() {
  const { orderbooks, tickers, selectedMarket, connect, tradeData } = useMarketStore();

  useEffect(() => {
    connect();
  }, [connect]);

  const orderbook = orderbooks[selectedMarket];
  const ticker = tickers[selectedMarket];
  const asks = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  const bids = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  const change = ticker ? (ticker.signed_change_rate * 100).toFixed(2) + "%" : "";
  const trades = tradeData?.[selectedMarket] ?? [];
  
  // 체결강도 계산
  const tradeStrength = ticker ? ((ticker.acc_bid_volume / ticker.acc_ask_volume) * 100).toFixed(2) : '0.00';
  
  // 거래량: 정수, 거래대금: 백만원 단위(소수점 2자리)
  const formattedVolume = ticker ? Math.floor(ticker.acc_trade_volume_24h).toLocaleString() : '-';
  const formattedPrice = ticker ? (ticker.acc_trade_price_24h / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '-';
  
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
                  <div className="text-gray-700 text-right font-medium pr-2">{item.ask_size.toLocaleString()}</div>
                  <div className="flex items-center gap-x-4 justify-center">
                    <span className="text-red-600 font-bold">{item.ask_price.toLocaleString()}</span>
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
                  <div className="font-bold text-red-600">{ticker ? ticker.high_price.toLocaleString() : '-'}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">저가</span>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{ticker ? ticker.low_price.toLocaleString() : '-'}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">전일종가</span>
                <div className="font-bold">{ticker ? ticker.prev_closing_price.toLocaleString() : '-'}</div>
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
                <div className={`w-28 pr-4 text-center font-medium text-black-500`}>{item.trade_price.toLocaleString()}</div>
                <div className={`flex-1 text-right font-medium pr-4 ${item.ask_bid === 'ASK' ? 'text-blue-600' : 'text-red-600'}`}>
                  {Math.floor(item.trade_price * item.trade_volume).toLocaleString()}
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
                    <span className="text-red-600 font-bold">{item.bid_price.toLocaleString()}</span>
                    <span className="text-red-600 font-medium pr-6">{change}</span>
                  </div>
                  <div className="text-gray-700 text-left font-medium pl-2">{item.bid_size.toLocaleString()}</div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
