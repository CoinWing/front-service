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

  // 기간 누적 손익 계산 (거래내역 기반)
  getPeriodProfitLoss: (
    tradeHistory: TradeHistory[], 
    tickers: Record<string, any>, 
    days: number
  ) => {
    const { getCurrentPrice } = get();
    
    // N일 전 날짜 계산
    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - days);
    
    // 기간 내 거래 필터링
    const periodTrades = tradeHistory.filter(trade => {
      const tradeDate = new Date(trade.concludedAt);
      return tradeDate >= nDaysAgo;
    });

    if (periodTrades.length === 0) {
      return {
        periodProfitLoss: 0,
        periodProfitLossRate: 0,
      };
    }

    // 기간 내 투자금 및 실현손익 계산
    let totalInvestment = 0;  // 총 투자금 (매수금액)
    let totalRealization = 0; // 총 실현금액 (매도금액)
    const portfolioChanges: Record<string, { quantity: number; totalCost: number }> = {};

    // 거래내역을 시간순으로 정렬
    const sortedTrades = [...periodTrades].sort((a, b) => 
      new Date(a.concludedAt).getTime() - new Date(b.concludedAt).getTime()
    );

    // 각 거래를 순회하며 포트폴리오 변화량 및 투자/실현 금액 계산
    sortedTrades.forEach(trade => {
      const market = trade.marketCode;
      
      if (!portfolioChanges[market]) {
        portfolioChanges[market] = { quantity: 0, totalCost: 0 };
      }

      if (trade.orderPosition === 'BUY') {
        // 매수: 투자금 증가, 보유량 증가
        totalInvestment += trade.tradePrice;
        portfolioChanges[market].quantity += trade.tradeQuantity;
        portfolioChanges[market].totalCost += trade.tradePrice;
      } else if (trade.orderPosition === 'SELL') {
        // 매도: 실현금액 증가, 보유량 감소
        totalRealization += trade.tradePrice;
        portfolioChanges[market].quantity -= trade.tradeQuantity;
        
        // 매도한 만큼 비례적으로 원가 감소
        const sellRatio = trade.tradeQuantity / (portfolioChanges[market].quantity + trade.tradeQuantity);
        portfolioChanges[market].totalCost -= portfolioChanges[market].totalCost * sellRatio;
      }
    });

    // 미실현 손익 계산 (기간 중 보유량 변화분의 현재가치)
    let unrealizedProfitLoss = 0;
    
    Object.entries(portfolioChanges).forEach(([market, changes]) => {
      if (changes.quantity > 0) {
        // 보유량이 증가한 경우: 현재가치 - 투자원가
        const currentPrice = getCurrentPrice(market, tickers);
        const currentValue = changes.quantity * currentPrice;
        unrealizedProfitLoss += (currentValue - changes.totalCost);
      } else if (changes.quantity < 0) {
        // 보유량이 감소한 경우: 이미 실현손익에 반영됨
        // 추가 계산 필요 없음
      }
    });

    // 실현 손익 (매도금액 - 매도한 코인들의 원가)
    const realizedProfitLoss = totalRealization - (totalInvestment * (totalRealization / (totalInvestment + Math.abs(totalRealization - totalInvestment))));

    // 총 기간 누적 손익 = 실현손익 + 미실현손익
    const periodProfitLoss = realizedProfitLoss + unrealizedProfitLoss;
    
    // 기간 수익률 계산 (투자금 대비)
    const periodProfitLossRate = totalInvestment > 0 ? (periodProfitLoss / totalInvestment) * 100 : 0;

    return {
      // -0으로 return되는 것 방지
      periodProfitLoss: Math.abs(Number(periodProfitLoss.toFixed(2))) === 0 ? 0 : Number(periodProfitLoss.toFixed(2)),
      periodProfitLossRate: Math.abs(Number(periodProfitLossRate.toFixed(2))) === 0 ? 0 : Number(periodProfitLossRate.toFixed(2))
    };
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