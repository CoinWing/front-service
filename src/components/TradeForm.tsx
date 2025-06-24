"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { useMarketStore } from "@/store/marketStore"

export default function TradeForm() {
  const { tickers, selectedMarket } = useMarketStore();
  const [activeTab, setActiveTab] = useState("매수")
  const [price, setPrice] = useState("")
  const [selectedPercentage, setSelectedPercentage] = useState("")

  const tabs = [
    { id: "매수", label: "매수" },
    { id: "매도", label: "매도" },
  ]

  const percentages = ["10%", "25%", "50%", "100%", "직접입력"]

  // 선택된 마켓의 현재가를 가격 입력란에 설정
  useEffect(() => {
    const currentPrice = tickers[selectedMarket]?.trade_price;
    if (currentPrice) {
      setPrice(new Intl.NumberFormat('ko-KR').format(currentPrice));
    }
  }, [selectedMarket, tickers]);

  const currentPrice = tickers[selectedMarket]?.trade_price || 0;

  return (
    <div className="w-full bg-white border rounded-md">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-3 font-medium ${
              activeTab === tab.id
                ? tab.id === "매수"
                  ? "text-red-500 border-b-2 border-red-500"
                  : "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Type */}
      <div className="p-4 flex items-center">
        <div className="flex items-center mr-2">
          <span className="text-sm mr-1">주문유형</span>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input type="radio" name="orderType" className="mr-1 accent-blue-600" defaultChecked />
            <span className="text-sm">지정가</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="orderType" className="mr-1 accent-blue-600" />
            <span className="text-sm">시장가</span>
          </label>
        </div>
      </div>

      {/* Available Balance */}
      <div className="px-4 py-2 flex justify-between">
        <span className="text-sm">주문가능</span>
        <span className="text-sm font-medium">0 KRW</span>
      </div>

      {/* Price Input */}
      <div className="px-4 py-2">
        <div className="flex items-center mb-1">
          <span className="text-sm">{activeTab === "매수" ? "매수가격" : "매도가격"} (KRW)</span>
        </div>
        <div className="flex">
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 border rounded-l p-2 text-right"
            placeholder="가격을 입력하세요"
          />
          <div className="flex border-t border-r border-b rounded-r">
            <button 
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => {
                const numPrice = parseInt(price.replace(/,/g, '')) || currentPrice;
                setPrice(new Intl.NumberFormat('ko-KR').format(Math.max(0, numPrice - 1000)));
              }}
            >
              −
            </button>
            <button 
              className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => {
                const numPrice = parseInt(price.replace(/,/g, '')) || currentPrice;
                setPrice(new Intl.NumberFormat('ko-KR').format(numPrice + 1000));
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Percentage Buttons */}
      <div className="px-4 py-2 grid grid-cols-5 gap-2">
        {percentages.map((percent) => (
          <button
            key={percent}
            className={`py-1 text-sm border rounded ${
              selectedPercentage === percent ? "bg-gray-100 border-gray-400" : "border-gray-300"
            }`}
            onClick={() => setSelectedPercentage(percent)}
          >
            {percent}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 py-2">
        <div className="flex items-center mb-1">
          <span className="text-sm">주문총액 (KRW)</span>
        </div>
        <input type="text" readOnly value="0" className="w-full border rounded p-2 text-right" />
      </div>

      {/* Fee Info */}
      <div className="px-4 py-2 text-xs text-gray-500 text-center">
        최소 결제 금액: 5,000 KRW (*예제 안내문구입니다.)
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 grid grid-cols-2 gap-2">
        <button className="py-3 bg-gray-400 text-white rounded">초기화</button>
        <button 
          className={`py-3 text-white rounded ${
            activeTab === "매수" ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {activeTab}
        </button>
      </div>
    </div>
  )
}
