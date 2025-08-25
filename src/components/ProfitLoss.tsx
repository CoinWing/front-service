'use client'

import { useState, useEffect, useRef } from "react";

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

  const { 
    tradeHistory, 
    isTradeHistoryLoading,
    fetchTradeHistory 
  } = useAssetStore();
  const [chartData, setChartData] = useState<DataByDate[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Store 가져오기
  const tickers = useMarketStore(state => state.tickers);
  const { loadInitialData } = useMarketStore();
  const assets = useAssetStore(state => state.assets);
  const { getPeriodProfitLoss } = useAssetStore();
  
  // 최초 계산 여부를 추적하는 ref
  const hasCalculatedRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // 데이터 초기화 (페이지 직접 접근 시)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    const initializeData = async () => {
      try {
        // 시장 데이터가 없으면 로드
        if (Object.keys(tickers).length === 0) {
          await loadInitialData();
        }
        
        // 거래 내역이 없으면 로드
        if (tradeHistory.length === 0 && !isTradeHistoryLoading) {
          await fetchTradeHistory();
        }
        
        hasInitializedRef.current = true;
      } catch (error) {
        console.error('데이터 초기화 실패:', error);
      }
    };

    initializeData();
  }, [tickers, tradeHistory, isTradeHistoryLoading, loadInitialData, fetchTradeHistory]);

  const handleTabChange = (tab: string) => {
    if (tab === "보유자산") {
      router.push('/portfolio/holdings');
    } else {
      router.push('/portfolio/profit-loss');
    }
  }

  // concludedAt 파싱 및 날짜만 추출하는 함수
  const parseConcludedAtAndExtractDate = (concludedAt: any): string => {
    try {
      let date: Date;
      
      if (Array.isArray(concludedAt)) {
        // 배열 형태: [2025, 8, 21, 12, 29, 18, 342090000]
        const [year, month, day] = concludedAt;
        date = new Date(year, month - 1, day); // month는 0-based
      } else if (typeof concludedAt === 'string') {
        // 문자열이 배열 형태로 온 경우: "2025,8,21,12,29,18,342090000"
        if (concludedAt.includes(',')) {
          const parts = concludedAt.split(',').map(Number);
          const [year, month, day] = parts;
          date = new Date(year, month - 1, day);
        } else {
          // 일반적인 날짜 문자열
          date = new Date(concludedAt);
        }
      } else {
        // 기타 형태
        date = new Date(concludedAt);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn(`유효하지 않은 날짜: ${concludedAt}`);
        return String(concludedAt).slice(0, 10); // fallback
      }
      
      // YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn(`날짜 파싱 오류: ${concludedAt}`, error);
      return String(concludedAt).slice(0, 10); // fallback
    }
  };

  // 거래 내역 기반 일자별 누적 수익률 계산 함수 (년-월-일 기준으로만 묶기)
  const calculateCumulativeProfitLossByDate = (trades: TradeHistory[]) => {
    if (!trades || trades.length === 0) {
      console.log("거래 내역이 없습니다.");
      return [];
    }

    if (!tickers || Object.keys(tickers).length === 0) {
      console.log("티커 데이터가 로드되지 않았습니다.");
      return [];
    }

    console.log(`\n🔍 거래 내역 분석 시작: ${trades.length}개 거래`);
    
    // 처음 3개 거래의 원본 데이터 확인
    console.log("📋 처음 3개 거래 원본 데이터:");
    trades.slice(0, 3).forEach((trade, i) => {
      console.log(`  ${i+1}. 원본: ${JSON.stringify(trade.concludedAt)}`);
      console.log(`     파싱: "${parseConcludedAtAndExtractDate(trade.concludedAt)}"`);
    });

    // 날짜별로 거래 분류 (년-월-일 기준)
    const tradesByDate: Record<string, TradeHistory[]> = {};

    // 거래를 시간순으로 정렬하기 위해 파싱된 Date 객체 사용
    const sortedTrades = [...trades].sort((a, b) => {
      const dateA = Array.isArray(a.concludedAt) 
        ? new Date(a.concludedAt[0], a.concludedAt[1] - 1, a.concludedAt[2], a.concludedAt[3], a.concludedAt[4], a.concludedAt[5])
        : new Date(a.concludedAt);
      const dateB = Array.isArray(b.concludedAt)
        ? new Date(b.concludedAt[0], b.concludedAt[1] - 1, b.concludedAt[2], b.concludedAt[3], b.concludedAt[4], b.concludedAt[5])
        : new Date(b.concludedAt);
      return dateA.getTime() - dateB.getTime();
    });

    // 각 거래의 날짜를 추출 (년-월-일만)
    sortedTrades.forEach(trade => {
      const dateOnly = parseConcludedAtAndExtractDate(trade.concludedAt);
      
      if (!tradesByDate[dateOnly]) {
        tradesByDate[dateOnly] = [];
      }
      tradesByDate[dateOnly].push(trade);
    });

    // 날짜를 정렬
    const sortedDates = Object.keys(tradesByDate).sort();
    
    console.log(`\n📅 날짜별 그룹핑 결과:`);
    console.log(`총 ${sortedDates.length}개의 서로 다른 날짜 발견`);
    
    sortedDates.forEach(date => {
      console.log(`  ${date}: ${tradesByDate[date].length}개 거래`);
    });

    if (sortedDates.length === 0) {
      console.log("❌ 정렬된 날짜가 없습니다.");
      return [];
    }

    // 누적 거래 내역
    let accumulatedTrades: TradeHistory[] = [];
    const dataByDate: DataByDate[] = [];

    console.log(`\n📈 일자별 누적 손익 계산 시작:`);

    // 각 날짜별로 누적 수익률 계산 (년-월-일 기준으로 통합)
    sortedDates.forEach((date, index) => {
      // 이 날짜까지의 모든 거래 누적
      accumulatedTrades = [...accumulatedTrades, ...tradesByDate[date]];
      
      console.log(`\n  📊 ${date} (${index + 1}/${sortedDates.length}):`);
      console.log(`    - 이 날짜 거래 수: ${tradesByDate[date].length}개`);
      console.log(`    - 누적 거래 수: ${accumulatedTrades.length}개`);

      try {
        // 전체 누적 데이터 계산 (days = 0으로 전체 기간)
        const profitLossData = getPeriodProfitLoss(accumulatedTrades, tickers, 0);
        
        console.log(`    - 계산 결과: 손익=${profitLossData.periodProfitLoss}, 수익률=${profitLossData.periodProfitLossRate}%`);

        // 결과 저장 (년-월-일 기준으로 하나의 데이터 포인트)
        dataByDate.push({
          date,
          profitLossRate: Number(profitLossData.periodProfitLossRate.toFixed(2)),
          profitLoss: Math.floor(profitLossData.periodProfitLoss)
        });
        
      } catch (err) {
        console.error(`    ❌ 날짜 ${date} 처리 중 오류:`, err);
      }
    });

    console.log(`\n✅ 최종 결과:`);
    console.log(`생성된 데이터 포인트: ${dataByDate.length}개`);
    console.log("최종 데이터 배열:", dataByDate);

    return dataByDate;
  };

  // 거래 내역으로부터 차트 데이터 계산 (최초 접속 시에만)
  useEffect(() => {
    // 이미 계산했거나 로딩 중이면 건너뛰기
    if (hasCalculatedRef.current || isTradeHistoryLoading || !tradeHistory.length || !tickers || Object.keys(tickers).length === 0) {
      return;
    }

    try {
      console.log("최초 접속: 차트 데이터 계산 중...");
      const data = calculateCumulativeProfitLossByDate(tradeHistory);
      console.log("계산된 차트 데이터:", data);

      if (data.length > 0) {
        setChartData(data);
        setError(null);
        hasCalculatedRef.current = true; // 계산 완료 플래그 설정
        console.log("차트 데이터 계산 완료 - 이후 재계산하지 않음");
      } else {
        setError("계산된 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("차트 데이터 계산 중 오류:", err);
      setError("데이터 계산 중 오류가 발생했습니다.");
    }
  }, [tradeHistory, tickers, isTradeHistoryLoading, getPeriodProfitLoss]);

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
