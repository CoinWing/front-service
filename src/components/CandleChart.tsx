'use client'

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useCandleStore } from "@/store/candleStore";
import { useMarketStore } from "@/store/marketStore";
import { createDynamicComponent } from "@/lib/dynamicImportUtils";

type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

// 동적 import
const ChartComponent = createDynamicComponent(
  () => import("@/lib/chartUtils"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

export const CandleChart = () => {
  const { candles, error, selected_time, timeUnit, isFetching, set_selectedTime, set_timeUnit, fetchAdditionCandles } = useCandleStore();
  const { markets,  selectedMarket } = useMarketStore();

  // 데이터 가져오기 (의존성 최적화)
  useEffect(() => {
    if(selectedMarket) {
      console.log('Fetching candles for market:', selectedMarket);
      fetchAdditionCandles(selectedMarket);
    }
  }, [selectedMarket, selected_time.time, selected_time.cnt, fetchAdditionCandles]);

  const selectedTime = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.options[e.target.selectedIndex];
    const time = selected.value.split("_");

    set_selectedTime(time[0], Number(time[1]));
    
    // timeUnit을 TimeUnit 타입으로 캐스팅
    const timeUnitMap: Record<string, 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'> = {
      'second': 'second',
      'minute': 'minute', 
      'hour': 'hour',
      'day': 'day',
      'week': 'week',
      'month': 'month',
      'quarter': 'quarter',
      'year': 'year'
    };
    
    const mappedTimeUnit = timeUnitMap[time[2]] || 'hour';
    set_timeUnit(mappedTimeUnit);

  }, [set_selectedTime, set_timeUnit]);

  // 기본값 메모이제이션
  const defaultTimeValue = useMemo(() => 'minutes_30_hour', []);
  
  // 현재 마켓의 한글 이름 찾기
  const currentMarketName = useMemo(() => {
    const market = markets.find(m => m.market === selectedMarket);
    return market?.korean_name || selectedMarket;
  }, [markets, selectedMarket]);
  
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div>
      
      <div className="flex items-center gap-4 p-4 bg-gray-100 border rounded-lg shadow-lg"> 
        <div className="flex items-center">
          <span className="text-lg font-semibold text-gray-700 mr-4">
            {currentMarketName}
          </span>
        </div>

        <div className="relative">
          <select 
            className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring focus:ring-blue-200" 
            onChange={selectedTime} 
            defaultValue={defaultTimeValue}
            disabled={isFetching}
          >
            <option key={'minute_3'} value={'minutes_3_minute'}>3분</option>
            <option key={'minute_15'} value={'minutes_15_minute'}>15분</option>
            <option key={'minute_30'} value={'minutes_30_hour'}>30분</option>
          </select>
        </div>

        {isFetching && (
          <div className="flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            {candles.length === 0 ? '데이터를 불러오는 중...' : '데이터를 업데이트하는 중...'}
          </div>
        )}
      </div>
      
      <div className="relative">
        {candles.length > 0 && (
        <ChartComponent 
          key={`${selectedMarket}-${selected_time.time}-${selected_time.cnt}`}
          market={selectedMarket} 
          candle={candles}  
          timeUnit={timeUnit as 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'}
        />
        )}        
        {(candles.length === 0 || isFetching) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 border border-gray-200 rounded-lg">
            <div className="flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              {isFetching ? '차트 데이터를 불러오는 중...' : '차트 데이터를 선택해주세요'}
            </div>
          </div>
        )}
      </div>

      
      
    </div>
  )
}



export default CandleChart;