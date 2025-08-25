'use client';

import { useState, useEffect } from 'react';
import { useAssetStore } from '@/store/assetStore';
import { useMarketStore } from '@/store/marketStore';

const ProfitSummary = () => {
  const tickers = useMarketStore(state => state.tickers);
  const { 
    getPeriodProfitLoss, 
    tradeHistory, 
    isTradeHistoryLoading,
    fetchTradeHistory // fetchTradeHistory 추가
  } = useAssetStore();

  const [selectedPeriod, setSelectedPeriod] = useState("1주일");
  const [displayData, setDisplayData] = useState<{
    periodProfitLoss: number;
    periodProfitLossRate: number;
  } | null>(null);

  // 선택된 기간에 따른 일수 계산
  const getPeriodDays = (period: string): number => {
    switch (period) {
      case '1주일': return 7;
      case '1개월': return 30;
      case '3개월': return 90;
      case '6개월': return 180;
      default: return 30;
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 확인
  useEffect(() => {
    console.log('=== ProfitLossNum Debug ===');
    console.log('tradeHistory length:', tradeHistory.length);
    console.log('tradeHistory:', tradeHistory);
    console.log('tickers keys length:', Object.keys(tickers).length);
    console.log('tickers:', tickers);
    console.log('isTradeHistoryLoading:', isTradeHistoryLoading);
    
    // 데이터가 없으면 다시 로드 시도
    if (tradeHistory.length === 0 && !isTradeHistoryLoading) {
      console.log('Attempting to fetch trade history...');
      fetchTradeHistory();
    }
  }, [tradeHistory, tickers, isTradeHistoryLoading, fetchTradeHistory]);

  // 기간별 손익 계산
  useEffect(() => {
    console.log('=== Calculation useEffect ===');
    console.log('isTradeHistoryLoading:', isTradeHistoryLoading);
    console.log('tickers length:', Object.keys(tickers).length);
    console.log('tradeHistory length:', tradeHistory.length);
    
    if (isTradeHistoryLoading || !tickers || Object.keys(tickers).length === 0) {
      console.log('Setting displayData to null - loading or no tickers');
      setDisplayData(null);
      return;
    }

    if (tradeHistory.length === 0) {
      console.log('Setting displayData to 0 - no trade history');
      setDisplayData({
        periodProfitLoss: 0,
        periodProfitLossRate: 0
      });
      return;
    }

    const days = getPeriodDays(selectedPeriod);
    console.log('Calculating for period:', selectedPeriod, 'days:', days);
    
    const profitLossData = getPeriodProfitLoss(tradeHistory, tickers, days);
    console.log('Calculated profit/loss data:', profitLossData);
    
    setDisplayData(profitLossData);
  }, [selectedPeriod, tradeHistory, tickers, isTradeHistoryLoading, getPeriodProfitLoss]);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2 ml-8 my-6">
        {['1주일', '1개월', '3개월', '6개월'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-3 py-1 rounded ${selectedPeriod === period ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {period}
          </button>
        ))}
      </div>

      {isTradeHistoryLoading ? (
        <div className="flex justify-center items-center h-32">
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : displayData ? (
        <div className="grid grid-cols-2 gap-2 ml-8 my-6 items-center">
          <div className="flex flex-col items-start space-y-3 self-start">
            <span className="text-gray-500 font-medium">기간 누적 손익</span>
            <div className="flex space-x-2">
              <p className={`text-6xl font-bold ${displayData.periodProfitLoss >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {displayData.periodProfitLoss >= 0 ? '+' : ''}
                {Math.floor(displayData.periodProfitLoss).toLocaleString()}
              </p>
              <p className="text-gray-500 font-semibold text-xl self-end">KRW</p>
            </div>
          </div>

          <div className="flex flex-col items-start space-y-3 self-start">
            <span className="text-gray-500 font-medium">기간 누적 손익률</span>
            <div className="flex space-x-2">
              <p className={`text-6xl font-bold ${displayData.periodProfitLossRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                {displayData.periodProfitLossRate >= 0 ? '+' : ''}
                {displayData.periodProfitLossRate.toFixed(2)}
              </p>
              <p className="text-gray-500 font-semibold text-xl self-end">%</p>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <p>선택한 기간에 거래 내역이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ProfitSummary;