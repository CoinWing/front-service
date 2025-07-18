import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { apiClient } from "@/lib/apiClient";
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore } from "@/store/assetStore";

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
  cumulativeProfitLossRate: number;
};

export default function CumulativeChart() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { tradeHistory, fetchTradeHistory, isTradeHistoryLoading } = useAssetStore();
  const [chartData, setChartData] = useState<DataByDate[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Store 가져오기
  const tickers = useMarketStore(state => state.tickers);
  const assets = useAssetStore(state => state.assets);
  const { getPeriodProfitLoss } = useAssetStore();

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
          cumulativeProfitLossRate: Number(profitLossData.periodProfitLossRate.toFixed(2))
        });
      } catch (err) {
        console.error(`날짜 ${date} 처리 중 오류 발생:`, err);
      }
    });

    console.log(`계산된 데이터 ${dataByDate.length}개 생성`);
    return dataByDate;
  };

  // 거래 내역 가져오기
  useEffect(() => {
    fetchTradeHistory();
  }, [fetchTradeHistory]);

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

  // 차트 그리기 (단 한번만 그리도록 설정)
  useEffect(() => {
    if (chartData.length === 0 || chartRef.current) return;

    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 데이터 값 얻기
      const values = chartData.map(item => item.cumulativeProfitLossRate);
      const lastValue = values[values.length - 1] || 0;

      // 평균값 계산
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      
      // 최대, 최소값 찾기
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      
      // 평균으로부터의 최대 편차 계산
      const maxDeviation = Math.max(
        Math.abs(maxValue - average),
        Math.abs(minValue - average)
      );
      
      // 평균을 중심으로 대칭적인 범위 설정 (여유분 20% 추가)
      const chartRange = maxDeviation * 1.2;
      
      // 축 범위 계산 (평균 기준으로 0.1% 단위로 올림/내림)
      const yMax = Math.ceil((average + chartRange) / 0.1) * 0.1;
      const yMin = Math.floor((average - chartRange) / 0.1) * 0.1;

      // 적절한 스텝 사이즈 계산 (수익률 기준)
      const range = Math.max(Math.abs(yMax), Math.abs(yMin));
      let stepSize = 0.05;
      if (range > 5) stepSize = 1;
      if (range > 10) stepSize = 2;
      if (range > 25) stepSize = 5;
      if (range > 50) stepSize = 10;
      if (range > 100) stepSize = 25;
      if (range > 200) stepSize = 50;
      if (range > 500) stepSize = 100;

      // 수익/손실에 따른 색상 설정
      const gradientFill = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (lastValue >= 0) {
        // 수익인 경우 빨간색 계열
        gradientFill.addColorStop(0, "rgba(255, 99, 132, 0.3)");
        gradientFill.addColorStop(1, "rgba(255, 99, 132, 0.05)");
      } else {
        // 손실인 경우 파란색 계열
        gradientFill.addColorStop(0, "rgba(54, 162, 235, 0.3)");
        gradientFill.addColorStop(1, "rgba(54, 162, 235, 0.05)");
      }

      // 차트 생성
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.map(item => item.date),
          datasets: [
            {
              label: "누적 수익률 (%)",
              data: chartData.map(item => item.cumulativeProfitLossRate),
              borderColor: lastValue >= 0 ? "#ff6384" : "#36A2EB",
              backgroundColor: gradientFill,
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex] as number;
                return value >= 0 ? "#ff6384" : "#36A2EB";
              }
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "일별 누적 수익률 추이",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.parsed.y;
                  return (value >= 0 ? '+' : '') + value.toFixed(2) + "%";
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
              },
              grid: { display: false },
            },
            y: {
              suggestedMin: yMin,
              suggestedMax: yMax,
              title: {
                display: true,
                text: '수익률 (%)'
              },
              ticks: {
                // 동적으로 계산된 간격으로 눈금 표시
                stepSize: stepSize,
                // 최대 9개 눈금으로 제한
                maxTicksLimit: 9,
                // 자동 스킵 방지
                autoSkip: false,
                callback: function (value) {
                  const numValue = Number(value);
                  return (numValue >= 0 ? '+' : '') + numValue + "%";
                },
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
                tickLength: 0,
              },
            },
          },
          // 자동 크기 계산 비활성화 
          maintainAspectRatio: false,
        },
      });
    };

    drawChart();
  }, [chartData]);

  return (
    <div className="w-full h-[500px] flex flex-col justify-center items-center p-4 rounded-xl bg-white">
      <div className="w-full h-full relative">
        {isTradeHistoryLoading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            차트 데이터가 없습니다.
          </div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
}