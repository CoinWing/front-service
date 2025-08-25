import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type DataByDate = {
  date: string; // YYYY-MM-DD
  profitLoss: number; // 누적 손익(원)
  profitLossRate: number;
};

interface Props {
  chartData: DataByDate[];
  isTradeHistoryLoading: boolean;
  chartError: string | null;
}

export default function CumulativeChart({chartData, isTradeHistoryLoading, chartError}: Props) {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  

  // 차트 그리기 (단 한번만 그리도록 설정)
  useEffect(() => {
    if (chartData.length === 0 || chartRef.current) return;

    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 데이터 값 얻기
      const values = chartData.map(item => item.profitLossRate);
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
              label: "일별 누적 손익률 (%)",
              data: chartData.map(item => item.profitLossRate),
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
          maintainAspectRatio: false, // ProfitLossChart와 동일
          interaction: {
            intersect: false,
            mode: 'index',
          },
          plugins: {
            title: {
              display: true,
              text: '일별 누적 손익률',
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  return `손익률: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
                }
              }
            }
          },
          scales: {
            y: {
              suggestedMin: yMin, // ProfitLossChart와 동일한 방식
              suggestedMax: yMax,
              title: {
                display: true,
                text: '손익률 (%)'
              },
              ticks: {
                stepSize: stepSize,
                maxTicksLimit: 9, // ProfitLossChart와 동일
                autoSkip: false, // ProfitLossChart와 동일
                callback: function(value) {
                  return `${Number(value).toFixed(2)}%`;
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)', // ProfitLossChart와 동일
                tickLength: 0, // ProfitLossChart와 동일
              }
            },
            x: {
              title: {
                display: true,
              },
              grid: { display: false }, // ProfitLossChart와 동일
              ticks: {
                maxTicksLimit: 10,
                callback: function(value, index) {
                  const date = chartData[index]?.date;
                  if (date) {
                    return date.slice(5); // MM-DD 형식으로 표시
                  }
                  return '';
                }
              }
            }
          }
        }
      });
    };

    drawChart();

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    }
  }, [chartData]);

  return (
    <div className="w-full h-[500px] flex flex-col justify-center items-center p-4 rounded-xl bg-white">
      <div className="w-full h-full relative">
        {isTradeHistoryLoading ? (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : chartError ? (
          <div className="absolute inset-0 flex justify-center items-center text-gray-500">
            {chartError}
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