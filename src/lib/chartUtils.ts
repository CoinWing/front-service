
import React, { useEffect, useRef } from "react";
import { Chart, TimeScale, Tooltip, Legend, ChartType, LinearScale } from "chart.js/auto";
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import "chartjs-adapter-date-fns"; // 날짜 포맷팅을 위한 어댑터
import zoomPlugin from 'chartjs-plugin-zoom';

// Chart.js candlestick chart controller 등록
Chart.register(
  CandlestickController,
  CandlestickElement,
  TimeScale,
  Tooltip,
  Legend,
  LinearScale,
  zoomPlugin,
  // 그 외... 등록할 요소들
)

interface Candle {
    x: number; // 시간 (timestamp)
    o: number; // 시가
    h: number; // 고가
    l: number; // 저가
    c: number; // 종가
}

type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
interface WriteChartProps {
    market: string;
    candle: Candle[];
    canvasRef: React.RefObject<HTMLCanvasElement>;
    timeUnit: TimeUnit;
}

// candlestick 차트
const WriteChart: React.FC<WriteChartProps> = ({ market, candle, canvasRef, timeUnit }) => {
    
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
        console.log(candle.length, "길이");
        console.log(candle[0], candle[candle.length - 1])

        // 차트 생성
        const chart = new Chart(ctx, {
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
                            // day, hour, millisecond, minute, month, quarter, second, week, year
                            unit: timeUnit,
                        },
                        title: {
                            display: true,
                            text: "시간",
                        },
                        min: candle[candle.length - 200].x, // 초기 표시 범위 시작
                        max: candle[candle.length - 1].x, // 초기 표시 범위 끝
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
                        callbacks: {
                            label: function (context: any) {
                                const { o, h, l, c } = context.raw;
                                return `시가: ${o}, 고가: ${h}, 저가: ${l}, 종가: ${c}`;
                            },
                        },
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        },
                    },
                },
            },
    });
}, [market, candle]);

    return null;
};

export default WriteChart;