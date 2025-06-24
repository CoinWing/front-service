import React, { useEffect, useRef } from "react";
import { Chart, TimeScale, Tooltip, Legend, ChartType, LinearScale } from "chart.js/auto";
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import "chartjs-adapter-date-fns"; // 날짜 포맷팅을 위한 어댑터
import zoomPlugin from 'chartjs-plugin-zoom';
import { format } from "date-fns";

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

     let chart_data: {x: number, y: number, data: any} | null = null;
     const chartRef = useRef<Chart | null>(null);
     const animationFrameRef = useRef<number | null>(null);
    
    useEffect(() => {
        // 캔버스 요소 가져오기
        const ctx = canvasRef.current?.getContext("2d");
        
        // 캔버스가 존재하지 않으면 종료
        if (!ctx) return;

        // candle 데이터가 없거나 비어있으면 종료
        if (!candle || candle.length === 0) {
            console.log("Candle data is empty or undefined");
            return;
        }

        // 기존 차트가 있고, 같은 마켓과 타임유닛이면 데이터만 업데이트
        if (chartRef.current && 
            chartRef.current.data.datasets[0].label === market &&
            (chartRef.current.options.scales?.x as any)?.time?.unit === timeUnit &&
            chartRef.current.data.datasets[0].data.length > 0) {
            
            // 데이터 업데이트
            chartRef.current.data.datasets[0].data = candle;
            
            // 차트 업데이트 (애니메이션 비활성화로 성능 향상)
            chartRef.current.update('none');
            
            // 스케일 범위 업데이트
            if (chartRef.current.options.scales?.x) {
                (chartRef.current.options.scales.x as any).min = candle.length > 200 ? candle[candle.length - 200].x : candle[0].x;
                (chartRef.current.options.scales.x as any).max = candle[candle.length - 1].x;
            }
            
            return;
        }

        // 기존 차트 제거
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        // 애니메이션 프레임 정리
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

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
                animation: {
                    duration: 0 // 애니메이션 비활성화로 성능 향상
                },
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
                        min: candle.length > 200 ? candle[candle.length - 200].x : candle[0].x, // 초기 표시 범위 시작
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
                        enabled: false,
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
                // 마우스가 차트 위에 있을 때 이벤트 발생
                onHover: function (event, chartElement, chart) {

                    if (event.native) {
                        // 차트 위 가장 가까운 차트 요소 가지고 옴
                        const elements = chart.getElementsAtEventForMode(
                            event.native,
                            "nearest",
                            { intersect: false },
                            true
                        );
                        // 데이터를 lastCrosshair에 저장
                        if (elements.length) {
                            const index = elements[0].index;
                            const data = chart.data.datasets[0].data[index];
                            if(event && event.x !== null && event.y !== null) {
                                chart_data = {x: event.x, y: event.y, data: data};
                            }
                        }
                    }
                },
            },
    });

    chartRef.current = chart;

    if(chart.ctx) {
          drawCrosshair();
    }

    // 교차선 구현
    function drawCrosshair() {
        const chart = chartRef.current;
        if (!chart) return;

        const chartArea = chart.chartArea;
        const ctx = chart.ctx;
        const xAxis = chart.scales['x'];
        const yAxis = chart.scales['y'];

        
        try {
            chart.update('none'); // 애니메이션 없이 업데이트
        } catch (e: any) {
            if (e.message.includes("Cannot read properties of null (reading 'ownerDocument')")) {
                // 에러 무시
            } else {
                return e;
            }
        }

                
        if (chart_data) {
            const {x: X, y, data} = chart_data;
            const {o, h, l, c, x: time} = data;

            // cavas 요소가 로드 안된 경우
            if(!ctx) {
                return;
            }
                
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([]); // 실선
            ctx.strokeStyle = "#0000000" // 선 색상
            ctx.lineWidth = 1; // 선 굵기

            ctx.fillStyle = 'black'; // 글씨
            ctx.font = '8px Arial'; // 폰트 설정
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top' // 텍스트 위치
                
            // 수직선
            ctx.moveTo(X, chartArea.top);
            ctx.lineTo(X, chartArea.bottom);
                
            // 수평선 
            ctx.moveTo(chartArea.left, y);
            ctx.lineTo(chartArea.right, y);

            // 데이터 정보
            ctx.fillText(`시가: ${o}`, xAxis.left + 32, yAxis.top + 10);
            ctx.fillText(`고가: ${h}`, xAxis.left + 32, yAxis.top + 20);
            ctx.fillText(`시간: ${format(time, 'yyyy.MM.dd HH:mm:ss')}`, xAxis.left + 48, yAxis.top + 30);
            ctx.fillText(`저가: ${l}`, xAxis.left + 110, yAxis.top + 10);
            ctx.fillText(`종가: ${c}`, xAxis.left + 110, yAxis.top + 20);
                
            ctx.stroke();
            ctx.restore();
        }
        
        // 성능 최적화: 마우스가 차트 위에 있을 때만 교차선 그리기
        if (chart_data) {
            animationFrameRef.current = requestAnimationFrame(drawCrosshair);
        } else {
            animationFrameRef.current = requestAnimationFrame(drawCrosshair);
        }
    };

    // 컴포넌트 언마운트 시 정리
    return () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
    };

}, [market, candle, timeUnit]);

    return null;
};

export default WriteChart;