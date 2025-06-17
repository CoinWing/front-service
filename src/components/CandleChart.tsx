'use client'

import React, { useEffect } from "react";
import dynamic from 'next/dynamic';

import { useCandleStore } from "@/store/candleStore";
import { Chart } from "chart.js";


// 마켓 코드, 3분봉 차트 예시 하드 코딩
const MARKET_CODE = "KRW-BTC";
const TIME = "minutes";
const CNT = 3;

// 동적 import로 ChartComponent 불러오기
const ChartComponent = dynamic(() => import("@/lib/chartUtils").then(mod => mod.default), {
  ssr: false,
});

export const CandleChart = () => {
  const { candles, error, fetchCandles } = useCandleStore();

  useEffect(() => {
    fetchCandles(MARKET_CODE, TIME, CNT);
  }, [fetchCandles]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>캔들 차트</h2>
      
      <canvas id="candle-chart" width={800} height={400}></canvas>

      <ChartComponent market={MARKET_CODE} candle={candles}></ChartComponent>
    </div>
  )
}

export default CandleChart;