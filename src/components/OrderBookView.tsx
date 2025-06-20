import { useEffect, useState } from "react"
import { useMarketStore } from "@/store/marketStore"
import GeneralAskingPrice from "./GeneralAskingPrice";
import GeneralAskingTotalPrice from "./GeneralAskingTotalPrice";
import CumulativeAskingPrice from "./CumulativeAskingPrice";

export default function OrderBookView() {
  const { connect } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'일반호가' | '누적호가'>('일반호가');

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <div className="bg-white h-screen flex flex-col">
      {/* 주문 탭 영역 (헤더) */}
      <div className="flex border-b bg-white">
        <button
          className={`px-6 py-3 font-medium ${activeTab === '일반호가' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`}
          onClick={() => setActiveTab('일반호가')}
        >
          일반호가
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === '누적호가' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700'}`}
          onClick={() => setActiveTab('누적호가')}
        >
          누적호가
        </button>
      </div>

      {activeTab === '일반호가' ? (
        <>
        <div className="flex flex-col h-9/10 overflow-y-scroll">
          <GeneralAskingPrice />
        </div>
        <div className="flex flex-col h-1/10">
          <GeneralAskingTotalPrice />
        </div>
        </>
      ) : (
        <div className="flex flex-col h-full overflow-y-scroll">
          <CumulativeAskingPrice />
        </div>
      )}

    </div>
  )
}
