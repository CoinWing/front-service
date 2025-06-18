import { create } from 'zustand';
import type { MarketState, OrderbookData, OrderbookUnit } from '@/types/market';

const MARKETS = ['KRW-BTC', 'KRW-ETH'];

export const useMarketStore = create<MarketState>((set) => ({
  orderbooks: {},
  selectedMarket: MARKETS[0],
  isLoading: false,
  error: null,
  currentPrice: null,

  connect: () => {
    set({ isLoading: true, error: null });
    // WebSocket 연결 로직 구현
    // 예시 데이터로 초기화
    set({
      orderbooks: {
        'KRW-BTC': {
          market: 'KRW-BTC',
          code: 'KRW-BTC',
          orderbook_units: [
            { ask_price: 65500, bid_price: 65400, ask_size: 0.3, bid_size: 0.5 },
            { ask_price: 65600, bid_price: 65300, ask_size: 0.7, bid_size: 1.2 },
            { ask_price: 65700, bid_price: 65200, ask_size: 1.1, bid_size: 0.8 },
          ],
          timestamp: Date.now(),
          total_ask_size: 2.1,
          total_bid_size: 2.5,
        },
        'KRW-ETH': {
          market: 'KRW-ETH',
          code: 'KRW-ETH',
          orderbook_units: [
            { ask_price: 3450, bid_price: 3440, ask_size: 1.5, bid_size: 2.0 },
            { ask_price: 3460, bid_price: 3430, ask_size: 2.2, bid_size: 1.8 },
            { ask_price: 3470, bid_price: 3420, ask_size: 1.8, bid_size: 1.5 },
          ],
          timestamp: Date.now(),
          total_ask_size: 5.5,
          total_bid_size: 5.3,
        },
      },
      isLoading: false,
    });
  },

  disconnect: () => {
    // WebSocket 연결 해제 로직 구현
    set({ isLoading: false, error: null });
  },

  setSelectedMarket: (market: string) => {
    set({ selectedMarket: market });
  },
})); 