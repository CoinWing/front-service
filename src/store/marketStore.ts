import { create } from 'zustand';
import { MarketState, MarketInfo } from '@/types/market';

// TradeData 타입 정의 (Upbit WebSocket trade 메시지 참고)
export interface TradeData {
  type: string;
  code: string;
  trade_price: number;
  trade_volume: number;
  ask_bid: 'ASK' | 'BID';
  trade_timestamp: number;
  timestamp: number;
}

const UPBIT_WS_URL = 'wss://api.upbit.com/websocket/v1';
const UPBIT_API_URL = 'https://api.upbit.com/v1';

// 마켓 정보를 가져오는 함수
const fetchMarkets = async (): Promise<MarketInfo[]> => {
  try {
    const response = await fetch(`${UPBIT_API_URL}/market/all?isDetails=false`);
    if (!response.ok) {
      throw new Error('Failed to fetch markets');
    }
    const markets: MarketInfo[] = await response.json();
    // KRW 마켓만 필터링
    return markets.filter(market => market.market.startsWith('KRW-'));
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
};

// 초기 시세 데이터를 가져오는 함수
const fetchInitialTickers = async (markets: MarketInfo[]) => {
  try {
    const marketCodes = markets.map(market => market.market).join(',');
    const response = await fetch(`${UPBIT_API_URL}/ticker?markets=${marketCodes}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tickers');
    }
    const tickers = await response.json();
    
    // tickers를 객체로 변환
    const tickersObject: Record<string, any> = {};
    tickers.forEach((ticker: any) => {
      tickersObject[ticker.market] = ticker;
    });
    
    return tickersObject;
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return {};
  }
};

export const useMarketStore = create<MarketState>((set, get) => ({
  tickers: {},
  orderbooks: {},
  selectedMarket: 'KRW-BTC',
  isLoading: false,
  error: null,
  currentPrice: null,
  ws: null,
  subscribedMarkets: new Set(),
  tradeData: {},
  markets: [],

  initializeMarkets: async () => {
    set({ isLoading: true });
    try {
      const markets = await fetchMarkets();
      set({ markets, isLoading: false });
      return markets;
    } catch (error) {
      set({ error: '마켓 정보를 가져오는데 실패했습니다.', isLoading: false });
      return [];
    }
  },

  // 초기 시세 데이터 로드
  loadInitialTickers: async () => {
    const { markets } = get();
    if (markets.length === 0) {
      await get().initializeMarkets();
    }
    
    set({ isLoading: true });
    try {
      const tickers = await fetchInitialTickers(markets);
      const currentPrice = tickers[get().selectedMarket]?.trade_price || null;
      
      set({ 
        tickers, 
        currentPrice, 
        isLoading: false 
      });
      
      console.log('Initial tickers loaded:', Object.keys(tickers).length, 'markets');
      return tickers;
    } catch (error) {
      set({ error: '초기 시세 데이터를 가져오는데 실패했습니다.', isLoading: false });
      return {};
    }
  },

  connect: async () => {
    const { ws, markets } = get();
    if (ws) return;

    set({ isLoading: true, error: null });
    
    // 마켓 정보가 없으면 초기화
    if (markets.length === 0) {
      await get().initializeMarkets();
    }

    // 초기 시세 데이터 로드
    await get().loadInitialTickers();

    const websocket = new WebSocket(UPBIT_WS_URL);

    websocket.onopen = () => {
      set({ ws: websocket, isLoading: false });
      
      const marketCodes = get().markets.map((market: MarketInfo) => market.market);
      
      // WebSocket 구독 - 실시간 업데이트만
      const subscribeMessage = [
        { ticket: 'UNIQUE_TICKET' },
        {
          type: 'ticker',
          codes: marketCodes,
          isOnlyRealtime: true
        },
        {
          type: 'orderbook',
          codes: marketCodes,
          isOnlyRealtime: true
        },
        {
          type: 'trade',
          codes: marketCodes,
          isOnlyRealtime: true
        }
      ];
      
      websocket.send(JSON.stringify(subscribeMessage));
      console.log('WebSocket connected and subscribed to', marketCodes.length, 'markets');
    };

    websocket.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);

          if (data.type === 'ticker') {
            const marketCode = data.code;
            
            set(state => {
              const newTickers = {
                ...state.tickers,
                [marketCode]: data
              };
              
              const currentPrice = marketCode === state.selectedMarket ? data.trade_price : state.currentPrice;
              
              return {
                tickers: newTickers,
                currentPrice
              };
            });
          } else if (data.type === 'orderbook') {
            set(state => ({
              orderbooks: {
                ...state.orderbooks,
                [data.code]: data
              }
            }));
          } else if (data.type === 'trade') {
            // 실시간 체결 데이터 누적 저장 (오늘 날짜만 유지, 중복 trade_timestamp 방지)
            set(state => {
              const today = new Date().toDateString();
              const prev = (state.tradeData[data.code] || []).filter(
                t => new Date(t.trade_timestamp).toDateString() === today
              );
              const alreadyExists = prev.some(t => t.trade_timestamp === data.trade_timestamp);
              const updated = alreadyExists ? prev : [data, ...prev].slice(0, 100); // 최대 100개만 유지
              return {
                tradeData: {
                  ...state.tradeData,
                  [data.code]: updated
                }
              };
            });
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      reader.readAsText(event.data);
    };

    websocket.onerror = (error) => {
      set({ error: 'WebSocket 연결 오류가 발생했습니다.' });
    };

    websocket.onclose = () => {
      set({ ws: null, isLoading: false });
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, subscribedMarkets: new Set() });
    }
  },

  setSelectedMarket: (market: string) => {
    const { tickers } = get();
    const currentPrice = tickers[market]?.trade_price || null;
    set({ selectedMarket: market, currentPrice });
  }
})); 