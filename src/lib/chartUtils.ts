
import React, { useEffect, useRef } from "react";
import { Chart, TimeScale, Tooltip, Legend, ChartType, LinearScale } from "chart.js/auto";
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import "chartjs-adapter-date-fns"; // 날짜 포맷팅을 위한 어댑터

// Chart.js candlestick chart controller 등록
Chart.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  Tooltip,
  Legend,
  LinearScale
  // 그 외... 등록할 요소들
)

interface Candle {
    x: number; // 시간 (timestamp)
    o: number; // 시가
    h: number; // 고가
    l: number; // 저가
    c: number; // 종가
}

interface WriteChartProps {
    market: string;
    candle: Candle[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
}


// candlestick 차트
const WriteChart: React.FC<WriteChartProps> = ({ market, candle, canvasRef }) => {
    
    useEffect(() => {

        // 캔버스 요소 가져오기
        const ctx = canvasRef.current;
        
        
        // 캔버스가 존재하지 않으면 종료
        if (!ctx) return;

        // 이미 차트가 존재하면 제거
        const exisChart = Chart.getChart(ctx);
        if(exisChart) {
            exisChart.destroy();
        }

        // console.log("차트에 들어가는 data:", candle);

        // 차트 생성
        new Chart(ctx, {
            type: "candlestick",
            data: {
                datasets: [

                    {
                        label: market,
                        data: candle,
                        borderColors: {
                            up: 'rgba(200, 0, 13, 0.8)',
                            down: 'rgba(0, 0, 200, 0.8)',
                            unchanged: 'rgba(143, 143, 143, 1)'
                        },
                        backgroundColors: {
                            up: 'rgba(200, 0, 13, 0.8)',
                            down: 'rgba(0, 0, 200, 0.8)',
                            unchanged: 'rgba(143, 143, 143, 1)'
                        }
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "minute",
                        },
                        title: {
                            display: true,
                            text: "시간",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "가격",   
                        },
                        beginAtZero: false, // 자동 min/max 설정
                    },
                },
                plugins: {
                    tooltip: {
                        mode: 'nearest',
                        intersect: true,
                        // callbacks: {
                        //     label: function (context: any) {
                        //         const { o, h, l, c } = context.raw;
                        //         return `시가: ${o}, 고가: ${h}, 저가: ${l}, 종가: ${c}`;
                        //     },
                        // },
                    },
                },
            },
    });
}, [market, candle]);

    return null;
};

export default WriteChart;