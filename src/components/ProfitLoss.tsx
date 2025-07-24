'use client'

import { useState, useEffect } from "react";

import CumulativeChart from "./CumulativeChart";
import ProfitLossChart from "./ProfitLossChart";
import ProfitLossWrapper from "./ProfitLossNum"; // 변경된 이름 사용
import MarketListCompoenet from "./MarketListComponent";
import { useRouter } from "next/navigation";
import { useAssetStore } from "@/store/assetStore";
import { useMarketStore } from "@/store/marketStore";

type TradeHistory = {
  concludedAt: string;
  marketCode: string;
  orderPosition: "BUY" | "SELL";
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

type DataByDate = {
  date: string; // YYYY-MM-DD
  profitLoss: number; // 누적 손익(원)
  profitLossRate: number;
};

export default function ProfitLossPage() {
  const [activeTab, setActiveTab] = useState("투자손익");
  const tabs = ["보유자산", "투자손익"];
  const router = useRouter();

  const { tradeHistory, isTradeHistoryLoading } = useAssetStore();
  const [chartData, setChartData] = useState<DataByDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Store 가져오기
  const tickers = useMarketStore(state => state.tickers);
  const assets = useAssetStore(state => state.assets);
  const { getPeriodProfitLoss } = useAssetStore();
  

  const handleTabChange = (tab: string) => {
    if (tab === "보유자산") {
      router.push('/portfolio/holdings');
    } else {
      router.push('/portfolio/profit-loss');
    }
  }

  // 거래 내역 기반 누적 수익률 계산 함수
    const calculateCumulativeProfitLossByDate = (trades: TradeHistory[]) => {
      if (!trades || trades.length === 0) {
        console.log("거래 내역이 없습니다.");
        return [];
      }
  
      if (!tickers || Object.keys(tickers).length === 0) {
        console.log("티커 데이터가 로드되지 않았습니다.");
        return [];
      }
  
      console.log(`거래 내역 ${trades.length}개 처리 중`);
  
      // 날짜별로 거래 분류
      const tradesByDate: Record<string, TradeHistory[]> = {};
  
      // 날짜별로 거래 정렬 (가장 오래된 거래부터)
      const sortedTrades = [...trades].sort((a, b) =>
        new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime()
      );
  
      // 각 거래의 날짜를 추출
      sortedTrades.forEach(trade => {
        const date = trade.concludedAt.slice(0, 10);
        if (!tradesByDate[date]) {
          tradesByDate[date] = [];
        }
        tradesByDate[date].push(trade);
      });
  
      // 날짜를 정렬
      const sortedDates = Object.keys(tradesByDate).sort();
  
      if (sortedDates.length === 0) {
        console.log("정렬된 날짜가 없습니다.");
        return [];
      }
  
      // 누적 거래 내역
      let accumulatedTrades: TradeHistory[] = [];
      const dataByDate: DataByDate[] = [];
  
      // 각 날짜별로 누적 수익률 계산
      sortedDates.forEach(date => {
        // 이 날짜까지의 모든 거래 누적
        accumulatedTrades = [...accumulatedTrades, ...tradesByDate[date]];
  
        try {
          // assetStore의 메소드를 사용해 누적 수익률 계산
          const profitLossData = getPeriodProfitLoss(accumulatedTrades, tickers, 30);
  
          // 결과 저장
          dataByDate.push({
            date,
            profitLossRate: Number(profitLossData.periodProfitLossRate.toFixed(2)),
            profitLoss:Math.floor(profitLossData.periodProfitLoss) // 소수점 버림
          });
        } catch (err) {
          console.error(`날짜 ${date} 처리 중 오류 발생:`, err);
        }
      });
  
      console.log(`계산된 데이터 ${dataByDate.length}개 생성`);
      return dataByDate;
    };

    // 거래 내역으로부터 차트 데이터 계산
      useEffect(() => {
        if (isTradeHistoryLoading || !tradeHistory.length || !tickers || Object.keys(tickers).length === 0) {
          return;
        }
    
        try {
          console.log("차트 데이터 계산 중...");
          const data = calculateCumulativeProfitLossByDate(tradeHistory);
          console.log("계산된 차트 데이터:", data);
    
          if (data.length > 0) {
            setChartData(data);
            setError(null);
          } else {
            setError("계산된 데이터가 없습니다.");
          }
        } catch (err) {
          console.error("차트 데이터 계산 중 오류:", err);
          setError("데이터 계산 중 오류가 발생했습니다.");
        }
      }, [tradeHistory, tickers, isTradeHistoryLoading]);

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="col-span-2 border rounded-md overflow-hidden bg-white">
        <div className="w-full max-w-6xl mx-auto pt-4 bg-white px-4 p-4">
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-4 w-full max-w-6xl mx-auto px-4 bg-white">
          <ProfitLossWrapper />

          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ProfitLossChart chartData={chartData} isTradeHistoryLoading={isTradeHistoryLoading} chartError={error} />
              <CumulativeChart chartData={chartData} isTradeHistoryLoading={isTradeHistoryLoading} chartError={error} />
            </div>
          </div>
        </div>

      </div>

      {/* Right section - 1/3 width (1 column) */}
            <div className="relative col-span-1">
              <MarketListCompoenet></MarketListCompoenet>
            </div>
          </main>
  );
}
