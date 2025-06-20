import { useEffect } from "react"
import { useMarketStore } from "@/store/marketStore"

export default function GeneralAskingTotalPrice() {
  const { orderbooks, selectedMarket, connect } = useMarketStore();

  useEffect(() => {
    connect();
  }, [connect]);

  const orderbook = orderbooks[selectedMarket];

  // 총액(KRW) 계산
  const askPrice = orderbook?.orderbook_units?.[0]?.ask_price ?? 0;
  const bidPrice = orderbook?.orderbook_units?.[0]?.bid_price ?? 0;
  const totalAskKRW = orderbook ? Math.floor(orderbook.total_ask_size * askPrice).toLocaleString() : '-';
  const totalBidKRW = orderbook ? Math.floor(orderbook.total_bid_size * bidPrice).toLocaleString() : '-';

  return (
    <div className="bg-white h-full flex flex-col">
      {/* 총액 영역 */}
      <div className="grid grid-cols-3 bg-gray-50 p-2">
        <div className="col-span-1 text-center">
          <span className="text-gray-600 font-medium">{totalAskKRW}</span>
        </div>
        <div className="col-span-1 text-center">
          <span className="font-bold">총액 <span className="text-xs text-gray-500">(KRW)</span></span>
        </div>
        <div className="col-span-1 text-center">
          <span className="text-gray-600 font-medium">{totalBidKRW}</span>
        </div>
      </div>
    </div>
  )
}
