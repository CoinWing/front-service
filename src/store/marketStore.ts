import { create } from 'zustand';
import { MarketState, MarketInfo } from '@/types/market';
import { getMarkets, getTickers, getOrderbooks, getTrades } from '@/lib/upbitApi';

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

// 마켓 정보를 가져오는 함수
const fetchMarkets = async (): Promise<MarketInfo[]> => {
  try {
    const markets: MarketInfo[] = await getMarkets();
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    return [];
  }
};

// 초기 시세 데이터를 가져오는 함수
const fetchInitialTickers = async (markets: MarketInfo[]) => {
  try {
    const marketCodes = markets.map(market => market.market).join(',');
    const tickers = await getTickers(marketCodes);
    
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

// 초기 주문서 데이터를 가져오는 함수
const fetchInitialOrderbooks = async (markets: MarketInfo[]) => {
  try {
    const marketCodes = markets.map(market => market.market).join(',');
    const orderbooks = await getOrderbooks(marketCodes);
    
    // orderbooks를 객체로 변환
    const orderbooksObject: Record<string, any> = {};
    orderbooks.forEach((orderbook: any) => {
      orderbooksObject[orderbook.market] = orderbook;
    });
    
    return orderbooksObject;
  } catch (error) {
    console.error('Error fetching orderbooks:', error);
    return {};
  }
};

// 초기 체결 데이터를 가져오는 함수
const fetchInitialTrades = async (market: string) => {
  try {
    const trades = await getTrades(market, '100');
    
    // TradeData 형식으로 변환
    return trades.map((trade: any) => ({
      type: 'trade',
      code: trade.market,
      trade_price: trade.trade_price,
      trade_volume: trade.trade_volume,
      ask_bid: trade.ask_bid,
      trade_timestamp: new Date(trade.trade_timestamp).getTime(),
      timestamp: new Date(trade.trade_timestamp).getTime()
    }));
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};

export const useMarketStore = create<MarketState>((set, get) => ({
  tickers: {},
  orderbooks: {},
  selectedMarket: 'KRW-BTC', // 기본값으로 설정
  isLoading: false,
  error: null,
  currentPrice: null,
  ws: null,
  isConnecting: false,
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

  // 초기 데이터 전체 로드 (tickers, orderbooks, trades)
  loadInitialData: async () => {
    const { markets, selectedMarket } = get();
    if (markets.length === 0) {
      await get().initializeMarkets();
    }
    
    set({ isLoading: true });
    try {
      // 병렬로 모든 초기 데이터 로드
      const [tickers, orderbooks, trades] = await Promise.all([
        fetchInitialTickers(markets),
        fetchInitialOrderbooks(markets),
        fetchInitialTrades(selectedMarket)
      ]);
      
      const currentPrice = tickers[selectedMarket]?.trade_price || null;
      
      set({ 
        tickers, 
        orderbooks,
        tradeData: {
          [selectedMarket]: trades
        },
        currentPrice, 
        isLoading: false 
      });
      
      console.log('Initial data loaded:', {
        tickers: Object.keys(tickers).length,
        orderbooks: Object.keys(orderbooks).length,
        trades: trades.length
      });
      
      return { tickers, orderbooks, trades };
    } catch (error) {
      console.error('Error loading initial data:', error);
      set({ error: '초기 데이터를 가져오는데 실패했습니다.', isLoading: false });
      return { tickers: {}, orderbooks: {}, trades: [] };
    }
  },

  // 클라이언트 사이드에서 저장된 마켓 복원
  restoreSelectedMarket: () => {
    if (typeof window !== 'undefined') {
      const savedMarket = localStorage.getItem('selectedMarket');
      if (savedMarket && savedMarket !== get().selectedMarket) {
        get().setSelectedMarket(savedMarket);
      }
    }
  },

  connect: async () => {
    const { ws, isConnecting, markets } = get();
    
    // 이미 연결되어 있거나 연결 중이면 중복 연결 방지
    if (ws?.readyState === WebSocket.OPEN || isConnecting) {
      console.log('WebSocket already connected or connecting, skipping...');
      return;
    }

    // 기존 연결이 있지만 닫혀있다면 정리
    if (ws) {
      ws.close();
      set({ ws: null });
    }

    set({ isConnecting: true, error: null });
    
    // 마켓 정보가 없으면 초기화
    if (markets.length === 0) {
      await get().initializeMarkets();
    }

    // 초기 데이터 로드 (REST API)
    console.log('Loading initial data via REST API...');
    await get().loadInitialData();
    console.log('Initial data loaded successfully');

    const websocket = new WebSocket(UPBIT_WS_URL);
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3초

    const attemptReconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        console.log(`WebSocket reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
        setTimeout(() => {
          get().connect();
        }, reconnectDelay);
      } else {
        set({ 
          error: 'WebSocket 연결에 실패했습니다. 페이지를 새로고침해주세요.', 
          isConnecting: false 
        });
      }
    };

    websocket.onmessage = (event) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);

          if (data.type === 'ticker') {
            const marketCode = data.code;
            
            // 선택된 마켓의 데이터만 업데이트
            if (marketCode === get().selectedMarket) {
              set(state => {
                const existingTicker = state.tickers[marketCode];
                if (existingTicker && 
                    existingTicker.trade_price === data.trade_price &&
                    existingTicker.signed_change_rate === data.signed_change_rate &&
                    existingTicker.timestamp === data.timestamp) {
                  return state; // 변경사항이 없으면 상태 업데이트하지 않음
                }

                const newTickers = {
                  ...state.tickers,
                  [marketCode]: data
                };
                
                return {
                  tickers: newTickers,
                  currentPrice: data.trade_price
                };
              });
            }
          } else if (data.type === 'orderbook') {
            const marketCode = data.code;
            
            // 선택된 마켓의 데이터만 업데이트
            if (marketCode === get().selectedMarket) {
              set(state => {
                const existingOrderbook = state.orderbooks[marketCode];
                if (existingOrderbook && 
                    existingOrderbook.timestamp === data.timestamp &&
                    JSON.stringify(existingOrderbook.orderbook_units) === JSON.stringify(data.orderbook_units)) {
                  return state; // 변경사항이 없으면 상태 업데이트하지 않음
                }

                return {
                  orderbooks: {
                    ...state.orderbooks,
                    [marketCode]: data
                  }
                };
              });
            }
          } else if (data.type === 'trade') {
            const marketCode = data.code;
            
            // 선택된 마켓의 데이터만 업데이트
            if (marketCode === get().selectedMarket) {
              set(state => {
                const today = new Date().toDateString();
                const prev = (state.tradeData[marketCode] || []).filter(
                  t => new Date(t.trade_timestamp).toDateString() === today
                );
                const alreadyExists = prev.some(t => t.trade_timestamp === data.trade_timestamp);
                
                // 중복된 데이터가 있으면 상태 업데이트하지 않음
                if (alreadyExists) {
                  return state;
                }
                
                const updated = [data, ...prev].slice(0, 100); // 최대 100개만 유지
                return {
                  tradeData: {
                    ...state.tradeData,
                    [marketCode]: updated
                  }
                };
              });
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
      reader.readAsText(event.data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      set({ error: 'WebSocket 연결 오류가 발생했습니다.', isConnecting: false });
    };

    websocket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      set({ ws: null, isConnecting: false });
      
      // 정상적인 종료가 아닌 경우에만 재연결 시도
      if (event.code !== 1000 && event.code !== 1001) {
        console.log('WebSocket closed unexpectedly, attempting to reconnect...');
        attemptReconnect();
      }
    };

    // 연결 타임아웃 설정
    const connectionTimeout = setTimeout(() => {
      if (websocket.readyState !== WebSocket.OPEN) {
        console.log('WebSocket connection timeout');
        websocket.close();
        set({ isConnecting: false });
        attemptReconnect();
      }
    }, 10000); // 10초 타임아웃

    websocket.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log('WebSocket connected successfully');
      set({ ws: websocket, isConnecting: false, error: null });
      reconnectAttempts = 0; // 연결 성공시 재시도 카운트 리셋
      
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
      console.log('WebSocket subscribed to', marketCodes.length, 'markets');
    };
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      console.log('Disconnecting WebSocket...');
      ws.close(1000, 'User initiated disconnect');
      set({ ws: null, subscribedMarkets: new Set() });
    }
  },

  setSelectedMarket: async (market: string) => {
    const { tickers, tradeData } = get();
    const currentPrice = tickers[market]?.trade_price || null;
    
    // URL 파라미터 업데이트 (브라우저 히스토리에 추가하지 않음)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('market', market);
      window.history.replaceState({}, '', url.toString());
      
      // 로컬 스토리지에도 저장
      localStorage.setItem('selectedMarket', market);
    }
    
    // 선택된 마켓의 체결 데이터가 없으면 로드
    if (!tradeData[market]) {
      try {
        const trades = await fetchInitialTrades(market);
        set(state => ({
          selectedMarket: market, 
          currentPrice,
          tradeData: {
            ...state.tradeData,
            [market]: trades
          }
        }));
      } catch (error) {
        console.error('Error loading trades for selected market:', error);
        set({ selectedMarket: market, currentPrice });
      }
    } else {
      set({ selectedMarket: market, currentPrice });
    }
  }
})); 