'use client'

import React, { useEffect, useRef } from "react";
import dynamic from 'next/dynamic';

import { useCandleStore } from "@/store/candleStore";
import { useMarketStore } from "@/store/marketStore";


// 마켓 코드, 3분봉 차트 예시 하드 코딩
const MARKET_CODE = "KRW-BTC";
const TIME = "minutes";
const CNT = 3;

// 동적 import로 ChartComponent 불러오기
const ChartComponent = dynamic(() => import("@/lib/chartUtils").then(mod => mod.default), {
  ssr: false,
});

export const CandleChart = () => {
  const { candles, error, selected_market, selected_time, timeUnit ,set_selectedTime,  set_selectedMarket, set_timeUnit ,fetchCandles, fetchAdditionCandles } = useCandleStore();
  const  { markets, initializeMarkets }  = useMarketStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    initializeMarkets();
  }, [initializeMarkets]);

  useEffect(() => {
    if(selected_market) {
      // fetchCandles();
      fetchAdditionCandles();
    }
  }, [selected_market, selected_time, fetchAdditionCandles]);

  const selectedMarket = (e: React.ChangeEvent<HTMLSelectElement>) => {
    set_selectedMarket(e.target.value);
  };

  const selectedTime = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.options[e.target.selectedIndex];
    const time = selected.value.split("_");

    console.log(time);
    set_selectedTime(time[0], Number(time[1]));
    set_timeUnit(time[2]);

    console.log(time)
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      
      
      <div className="flex tiems-center gap-4 p-4 bg-gray-100 border rounded-lg shadow-lg"> 
        <div className="relative">
          <select className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring focus:ring-blue-200" value={selected_market} onChange={selectedMarket}>
            {markets.map((market) => (
              <option key={market.market} value={market.market}>
                {market.korean_name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring focus:ring-blue-200" onChange={selectedTime} defaultValue={'minutes_30_hour'}>
            <option key={'second'} value={'seconds_second'}>초</option>
            <option key={'minute_1'} value={'minutes_1_minute'}>1분</option>
            <option key={'minute_3'} value={'minutes_3_minute'}>3분</option>
            <option key={'minute_5'} value={'minutes_5_minute'}>5분</option>
            <option key={'minute_10'} value={'minutes_10_minute'}>10분</option>
            <option key={'minute_15'} value={'minutes_15_minute'}>15분</option>
            <option key={'minute_30'} value={'minutes_30_hour'}>30분</option>
            <option>1시간</option>

          </select>
        </div>
      </div>
      
      <canvas ref={canvasRef} id="candle-chart" width={800} height={400}></canvas>

      <ChartComponent market={selected_market} candle={candles} canvasRef={canvasRef} timeUnit={timeUnit}></ChartComponent>
      
    </div>
  )
}



export default CandleChart;