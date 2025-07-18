import { useMarketStore } from "@/store/marketStore"

export default function CumulativeAskingPrice() {
  const { 
    orderbooks, 
    selectedMarket, 
    error, 
    isLoading, 
    isConnecting, 
    ws 
  } = useMarketStore();

  const orderbook = orderbooks[selectedMarket];
  const asks = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  const bids = orderbook?.orderbook_units?.slice(0, 30) ?? [];
  
  // 누적호가 계산
  // 매도 누적호가 (asks: 높은 가격이 아래로)
  const asksReversed = asks.slice().reverse();
  let askCumulativeVolume = 0;
  let askCumulativeAmount = 0;
  const askCumulativeRows = asksReversed.map(item => {
    askCumulativeVolume += item.ask_size || 0;
    const amount = (item.ask_size || 0) * (item.ask_price || 0);
    askCumulativeAmount += amount;
    return {
      ...item,
      cumulativeVolume: askCumulativeVolume,
      amount,
      cumulativeAmount: askCumulativeAmount,
    };
  }).reverse();

  // 매수 누적호가 (bids: 낮은 가격이 아래로)
  let bidCumulativeVolume = 0;
  let bidCumulativeAmount = 0;
  const bidCumulativeRows = bids.map(item => {
    bidCumulativeVolume += item.bid_size || 0;
    const amount = (item.bid_size || 0) * (item.bid_price || 0);
    bidCumulativeAmount += amount;
    return {
      ...item,
      cumulativeVolume: bidCumulativeVolume,
      amount,
      cumulativeAmount: bidCumulativeAmount,
    };
  });

  if (isLoading && Object.keys(orderbooks).length === 0) {
    return (
      <div className="bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">초기 데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

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

  const RealtimeIndicator = () => {
    if (isConnecting) {
      return (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-700">실시간 데이터 연동 중...</span>
          </div>
        </div>
      );
    }
    if (ws?.readyState === WebSocket.OPEN) {
      return (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-green-700">실시간 데이터 연동됨</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-white h-full flex flex-col">
      <RealtimeIndicator />
      {/* 주문 영역 (본문) */}
      <div className="grid grid-cols-3 grid-rows-60">
        {/* 매도호가 영역 */}
        <div className="col-span-3 row-span-30">
          <div className="flex-1">
            {askCumulativeRows.slice().reverse().map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 items-center h-8 px-3 text-sm border-b border-gray-100 bg-blue-50">
                <div className="text-right text-red-600 font-bold">{(item.ask_price || 0).toLocaleString()}</div>
                <div className="text-right">{(item.ask_size || 0).toLocaleString()}</div>
                <div className="text-right">{Math.floor(item.amount || 0).toLocaleString()}</div>
                <div className="text-right">{Math.floor(item.cumulativeAmount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 매수호가 영역 */}
        <div className="col-span-3 row-span-30">
          {bidCumulativeRows.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 items-center h-8 px-3 text-sm border-b border-gray-100 bg-red-50">
              <div className="text-right text-red-600 font-bold">{(item.bid_price || 0).toLocaleString()}</div>
              <div className="text-right">{(item.bid_size || 0).toLocaleString()}</div>
              <div className="text-right">{Math.floor(item.amount || 0).toLocaleString()}</div>
              <div className="text-right">{Math.floor(item.cumulativeAmount || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="col-span-3">
          <div className="grid grid-cols-4 bg-gray-100 text-small text-black-400 px-2 py-1">
            <div className="text-right">가격</div>
            <div className="text-right">수량(BTC)</div>
            <div className="text-right">금액(KRW)</div>
            <div className="text-right">누적(KRW)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
