import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

// PortfolioDto 구조에 맞는 타입
export type PortfolioDto = {
  name: string;           // 종목명 (예: "BTC")
  quantity: number;       // 구매 수량
  average_cost: number;   // 평단가
  total_cost: number;     // 총 구매 가격
};

// 거래내역 타입 정의
export type TradeHistory = {
  concludedAt: string;
  marketCode: string;
  orderPosition: 'BUY' | 'SELL';
  orderType: string;
  tradePrice: number;
  tradeQuantity: number;
};

// 미체결 타입
export type Pending = {
  uuid: string;
  marketCode: string;
  orderType: 'LIMIT' | 'MARKET';
  orderPosition: 'BUY' | 'SELL';
  totalQuantity: number;
  orderPrice: number;
  orderRequestedAt: number;
  status: string;
}

interface AssetState {
  assets: PortfolioDto[];
  holdings: number;
  isLoading: boolean;
  // 거래내역 관련 상태 추가
  tradeHistory: TradeHistory[];
  isTradeHistoryLoading: boolean;
  tradeHistoryLastFetch: number | null;
  // 미체결 관련 상태
  pendingInfo: Pending[];
  isPendingLoading: boolean;

  fetchPending: () => Promise<void>
  fetchPortfolio: (market_code?: string) => Promise<void>;
  // 거래내역 관련 메서드 추가
  fetchTradeHistory: () => Promise<void>;
  getCurrentPrice: (market: string, tickers: Record<string, any>) => number;
  getTotalValuation: (assets: PortfolioDto[], tickers: Record<string, any>) => [number, number];
  getDoughnutData: (assets: PortfolioDto[], tickers: Record<string, any>) => { label: string; data: number }[];
  getTotalSummary: (assets: PortfolioDto[], tickers: Record<string, any>, holdings: number) => [number, number, number, number, number];

  getPeriodProfitLoss: (
    tradeHistory: TradeHistory[], 
    tickers: Record<string, any>, 
    days: number
  ) => {
    periodProfitLoss: number;
    periodProfitLossRate: number;
  };

  // 누적 손익 계산 함수 추가
  getCumulativeProfitLoss: (
    tradeHistory: TradeHistory[], 
    tickers: Record<string, any>
  ) => {
    profitLoss: number;
    profitLossRate: number;
  };
}

// 보유코인 및 보유자산 조회 후 하나의 배열로 반환
const getUserPortfolio = async (market_code?: string) => {
  const portfolioResponse: PortfolioDto[] = await apiClient.userPorfolio(market_code);
  const holdingsResponse = await apiClient.userHoldings();

  return { portfolio: portfolioResponse, holdings: holdingsResponse.asset };
};

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  holdings: 0,
  isLoading: false,
  // 거래내역 관련 상태 초기화
  tradeHistory: [],
  isTradeHistoryLoading: false,
  tradeHistoryLastFetch: null,
  pendingInfo: [],
  isPendingLoading: false,

  // 보유코인 및 보유자산 조회
  fetchPortfolio: async (market_code?: string) => {
    const { isLoading } = get();
    if (isLoading) return; // 이미 로딩 중이면 중복 호출 방지

    try {
      set({ isLoading: true });
      const { portfolio, holdings } = await getUserPortfolio(market_code);
      set({ assets: portfolio, holdings: holdings });
    } finally {
      set({ isLoading: false });
    }
  },

  // 거래내역 조회 (캐싱 지원)
  fetchTradeHistory: async () => {
    const { isTradeHistoryLoading, tradeHistoryLastFetch } = get();
    
    // 이미 로딩 중이면 중복 호출 방지
    if (isTradeHistoryLoading) return;

    try {
      set({ isTradeHistoryLoading: true });
      const history = await apiClient.tradeHistory();
      set({ 
        tradeHistory: history || [],
        tradeHistoryLastFetch: Date.now()
      });
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
      set({ tradeHistory: [] });
    } finally {
      set({ isTradeHistoryLoading: false });
    }
  },

  // 현재 시세 계산
  getCurrentPrice: (market: string, tickers: Record<string, any>) => {
    return tickers[market]?.trade_price ?? 0;
  },

  // 총 평가 금액 계산
  getTotalValuation: (assets: PortfolioDto[], tickers: Record<string, any>) => {
    const { getCurrentPrice } = get();
    let totalBuyAmount = 0;
    let totalValuation = 0;

    assets.forEach(item => {
      const currentPrice = getCurrentPrice(item.name, tickers);
      if (currentPrice === 0) return;

      totalBuyAmount += item.total_cost;
      totalValuation += item.quantity * currentPrice;
    });

    return [totalBuyAmount, totalValuation];
  },

  // 원형 차트 데이터 계산
  getDoughnutData: (assets: PortfolioDto[], tickers: Record<string, any>) => {
    const { getCurrentPrice, getTotalValuation } = get();
    const [, totalValuation] = getTotalValuation(assets, tickers);

    if (totalValuation === 0) return [];

    return assets
      .map(asset => {
        const currentPrice = getCurrentPrice(asset.name, tickers);
        if (currentPrice === 0) return { label: asset.name, data: 0 };

        const valuation = asset.quantity * currentPrice;

        return {
          label: asset.name,
          data: Number(((valuation / totalValuation) * 100).toFixed(2)),
        };
      })
      .filter(item => item.data > 0);
  },

  // Portfolio 기반 총 요약 계산 메서드 구현
  getTotalSummary: (
    assets: PortfolioDto[],
    tickers: Record<string, any>,
    holdings: number
  ): [number, number, number, number, number] => {
    const { getTotalValuation } = get();
    const [totalBuyAmount, totalValuation] = getTotalValuation(assets, tickers);

    const totalProfitLoss = totalValuation - totalBuyAmount;
    const totalProfitLossRate = totalBuyAmount > 0 ? (totalProfitLoss / totalBuyAmount) * 100 : 0;
    const totalAsset = holdings + totalValuation;
    
    return [
      totalBuyAmount,      // 총 매수 금액
      totalValuation,      // 총 평가 금액
      totalAsset,          // 총 보유 자산
      totalProfitLoss,     // 총 평가 손익
      totalProfitLossRate  // 총 평가 수익률
    ];
  },

  // 누적 손익 계산 함수 (차트용)
  getCumulativeProfitLoss: (
    tradeHistory: TradeHistory[], 
    tickers: Record<string, any>
  ) => {
    console.log('[getCumulativeProfitLoss] 누적 손익 계산 시작:', { tradeHistory, tickers });
    
    const { getCurrentPrice } = get();
    let totalRealizedProfitLoss = 0;
    let totalInvestment = 0; // 총 투자금 (매수금액 누적)
    const portfolioChanges: Record<string, { quantity: number; totalCost: number; avgPrice: number }> = {};

    // 거래내역을 시간순으로 정렬
    const sortedTrades = [...tradeHistory].sort((a, b) => {
      let dateA: Date, dateB: Date;
      
      if (Array.isArray(a.concludedAt)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = a.concludedAt;
        dateA = new Date(year, month - 1, day, hour, minute, second);
      } else {
        dateA = new Date(a.concludedAt);
      }
      
      if (Array.isArray(b.concludedAt)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = b.concludedAt;
        dateB = new Date(year, month - 1, day, hour, minute, second);
      } else {
        dateB = new Date(b.concludedAt);
      }
      
      return dateA.getTime() - dateB.getTime();
    });

    // 각 거래를 순회하며 누적 손익 계산
    sortedTrades.forEach((trade) => {
      const market = trade.marketCode;
      
      if (!portfolioChanges[market]) {
        portfolioChanges[market] = { quantity: 0, totalCost: 0, avgPrice: 0 };
      }

      if (trade.orderPosition === 'BUY') {
        // 매수: 평균 단가 재계산 및 총 투자금 증가
        totalInvestment += trade.tradePrice; // 총 투자금 누적
        portfolioChanges[market].quantity += trade.tradeQuantity;
        portfolioChanges[market].totalCost += trade.tradePrice;
        portfolioChanges[market].avgPrice = portfolioChanges[market].totalCost / portfolioChanges[market].quantity;
        
      } else if (trade.orderPosition === 'SELL') {
        // 매도: 실현 손익 계산
        const sellCost = portfolioChanges[market].avgPrice * trade.tradeQuantity;
        const sellProfit = trade.tradePrice - sellCost;
        
        totalRealizedProfitLoss += sellProfit;
        
        portfolioChanges[market].quantity -= trade.tradeQuantity;
        portfolioChanges[market].totalCost -= sellCost;
        
        if (portfolioChanges[market].quantity <= 0) {
          portfolioChanges[market].avgPrice = 0;
          portfolioChanges[market].totalCost = 0;
        } else {
          portfolioChanges[market].avgPrice = portfolioChanges[market].totalCost / portfolioChanges[market].quantity;
        }
      }
    });

    // 미실현 손익 계산
    let totalUnrealizedProfitLoss = 0;
    Object.entries(portfolioChanges).forEach(([market, changes]) => {
      if (changes.quantity > 0) {
        const currentPrice = getCurrentPrice(market, tickers);
        const currentValue = changes.quantity * currentPrice;
        const unrealizedProfit = currentValue - changes.totalCost;
        totalUnrealizedProfitLoss += unrealizedProfit;
      }
    });

    // 총 누적 손익
    const totalProfitLoss = totalRealizedProfitLoss + totalUnrealizedProfitLoss;
    
    const profitLossRate = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    console.log('[getCumulativeProfitLoss] 결과:', {
      totalRealizedProfitLoss,
      totalUnrealizedProfitLoss,
      totalProfitLoss,
      totalInvestment,
      profitLossRate
    });

    return {
      profitLoss: Number(totalProfitLoss.toFixed(2)),
      profitLossRate: Number(profitLossRate.toFixed(2))
    };
  },

  // 기간 누적 손익 계산 (거래내역 기반)
  getPeriodProfitLoss: (
    tradeHistory: TradeHistory[], 
    tickers: Record<string, any>, 
    days: number
  ) => {
    console.log('[getPeriodProfitLoss] 입력 데이터:', { tradeHistory, tickers, days });
    
    const { getCurrentPrice } = get();

    // N일 전 날짜 계산
    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - days);
    console.log('[getPeriodProfitLoss] 기간 계산:', { days, nDaysAgo: nDaysAgo.toISOString() });

    // 기간 내 거래 필터링
    const periodTrades = tradeHistory.filter(trade => {
      // concludedAt을 Date 객체로 변환 (원본 변경 없음)
      let tradeDate: Date;
      
      if (Array.isArray(trade.concludedAt)) {
        const [year, month, day] = trade.concludedAt;
        tradeDate = new Date(year, month - 1, day);
      } else {
        tradeDate = new Date(trade.concludedAt);
      }
      
      // Date 유효성 검사
      if (isNaN(tradeDate.getTime())) {
        console.log('[getPeriodProfitLoss] 유효하지 않은 날짜:', trade.concludedAt);
        return false;
      }
      
      const isInPeriod = tradeDate >= nDaysAgo;
      console.log('[getPeriodProfitLoss] 날짜 비교:', {
        concludedAt: trade.concludedAt,
        tradeDate: tradeDate.toISOString(),
        nDaysAgo: nDaysAgo.toISOString(),
        isInPeriod
      });
      
      return isInPeriod;
    });
    console.log('[getPeriodProfitLoss] 기간 내 거래 필터링:', { 
      totalTrades: tradeHistory.length, 
      periodTrades: periodTrades.length,
      periodTradesData: periodTrades 
    });

    if (periodTrades.length === 0) {
      console.log('[getPeriodProfitLoss] 기간 내 거래 없음 - 0 반환');
      return {
        periodProfitLoss: 0,
        periodProfitLossRate: 0,
      };
    }

    // 기간 내 투자금 및 실현손익 계산
    let totalInvestment = 0;  // 총 투자금 (매수금액)
    let totalRealizedProfitLoss = 0; // 총 실현금액 (매도금액)
    const portfolioChanges: Record<string, { quantity: number; totalCost: number; avgPrice: number }> = {};

    // 거래내역을 시간순으로 정렬
    const sortedTrades = [...periodTrades].sort((a, b) => 
      new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime()
    );
    console.log('[getPeriodProfitLoss] 정렬된 거래내역:', sortedTrades);

    // 각 거래를 순회하며 포트폴리오 변화량 및 투자/실현 금액 계산
    sortedTrades.forEach((trade, index) => {
      const market = trade.marketCode;
      console.log(`[getPeriodProfitLoss] 거래 처리 ${index + 1}/${sortedTrades.length}:`, trade);
      
      if (!portfolioChanges[market]) {
        portfolioChanges[market] = { quantity: 0, totalCost: 0, avgPrice: 0 };
      }

      if (trade.orderPosition === 'BUY') {
        // 매수: 평균 단가 재계산 및 총 투자금 증가
        const beforeInvestment = totalInvestment;
        const beforePortfolio = { ...portfolioChanges[market] };
        
        totalInvestment += trade.tradePrice; // 총 투자금 증가
        portfolioChanges[market].quantity += trade.tradeQuantity;
        portfolioChanges[market].totalCost += trade.tradePrice;
        portfolioChanges[market].avgPrice = portfolioChanges[market].totalCost / portfolioChanges[market].quantity;
        
        console.log(`[getPeriodProfitLoss] 매수 처리:`, {
          market,
          tradePrice: trade.tradePrice,
          tradeQuantity: trade.tradeQuantity,
          before: { investment: beforeInvestment, portfolio: beforePortfolio },
          after: { investment: totalInvestment, portfolio: portfolioChanges[market] }
        });
        
      } else if (trade.orderPosition === 'SELL') {
        // 매도: 평균 단가 기준으로 실현 손익 계산
        const beforeRealized = totalRealizedProfitLoss;
        const beforePortfolio = { ...portfolioChanges[market] };
        
        const sellCost = portfolioChanges[market].avgPrice * trade.tradeQuantity;
        const sellProfit = trade.tradePrice - sellCost;
        
        totalRealizedProfitLoss += sellProfit; // 실현 손익 누적
        
        portfolioChanges[market].quantity -= trade.tradeQuantity;
        portfolioChanges[market].totalCost -= sellCost;
        
        // 수량이 0이 되면 평균가 리셋
        if (portfolioChanges[market].quantity <= 0) {
          portfolioChanges[market].avgPrice = 0;
          portfolioChanges[market].totalCost = 0;
        } else {
          portfolioChanges[market].avgPrice = portfolioChanges[market].totalCost / portfolioChanges[market].quantity;
        }
        
        console.log(`[getPeriodProfitLoss] 매도 처리:`, {
          market,
          tradePrice: trade.tradePrice,
          tradeQuantity: trade.tradeQuantity,
          sellCost,
          sellProfit,
          before: { realized: beforeRealized, portfolio: beforePortfolio },
          after: { realized: totalRealizedProfitLoss, portfolio: portfolioChanges[market] }
        });
      }
    });

    console.log('[getPeriodProfitLoss] 거래 처리 완료:', {
      totalInvestment,
      totalRealizedProfitLoss,
      portfolioChanges
    });

    // 미실현 손익: 현재 보유 중인 코인의 손익만 계산
    let totalUnrealizedProfitLoss = 0;
    Object.entries(portfolioChanges).forEach(([market, changes]) => {
      if (changes.quantity > 0) {
        const currentPrice = getCurrentPrice(market, tickers);
        const currentValue = changes.quantity * currentPrice;
        const unrealizedProfit = currentValue - changes.totalCost;
        totalUnrealizedProfitLoss += unrealizedProfit;
      }
    });

    // 총 손익 = 실현 손익 + 미실현 손익
    const periodProfitLoss = totalRealizedProfitLoss + totalUnrealizedProfitLoss;

    // 기간 수익률 계산 (투자금 대비)
    const periodProfitLossRate = totalInvestment > 0 ? (periodProfitLoss / totalInvestment) * 100 : 0;

    const result = {
      // -0으로 return되는 것 방지
      periodProfitLoss: Math.abs(Number(periodProfitLoss.toFixed(2))) === 0 ? 0 : Number(periodProfitLoss.toFixed(2)),
      periodProfitLossRate: Math.abs(Number(periodProfitLossRate.toFixed(2))) === 0 ? 0 : Number(periodProfitLossRate.toFixed(2))
    };

    console.log('[getPeriodProfitLoss] 최종 결과:', {
      totalInvestment,
      totalRealizedProfitLoss,
      totalUnrealizedProfitLoss,
      periodProfitLoss,
      periodProfitLossRate,
      result
    });

    return result;
  },

  fetchPending: async () => {
    const { isPendingLoading } = get();
    if(isPendingLoading) return;

    try {
      set ({ isPendingLoading: true });
      const pendings = await apiClient.pendingOrders();
      set({
        pendingInfo: pendings || [],
      });
    } catch(err) {
      console.error('Failed to fetch pending: ', err);
      set({ pendingInfo: [] });
    } finally {
      set({ isPendingLoading: false });
    }
  },
}));