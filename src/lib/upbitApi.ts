// UpBit API 클라이언트 유틸리티
const UPBIT_API_BASE = '/api/upbit';

// 공통 API 호출 함수
const callUpbitAPI = async (endpoint: string, params: Record<string, string> = {}) => {
  const queryParams = new URLSearchParams({ endpoint, ...params });
  const url = `${UPBIT_API_BASE}?${queryParams.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
};

// 마켓 정보 조회
export const getMarkets = async () => {
  return callUpbitAPI('market/all', { isDetails: 'false' });
};

// 시세 정보 조회
export const getTickers = async (markets: string) => {
  return callUpbitAPI('ticker', { markets });
};

// 주문서 정보 조회
export const getOrderbooks = async (markets: string) => {
  return callUpbitAPI('orderbook', { markets });
};

// 체결 정보 조회
export const getTrades = async (market: string, count: string = '100') => {
  return callUpbitAPI('trades/ticks', { market, count });
};

// 캔들 정보 조회
export const getCandles = async (params: {
  marketCode: string;
  time: string;
  timeCnt?: number | null;
  datetime?: string;
  count?: string;
}) => {
  const { marketCode, time, timeCnt, datetime, count = '200' } = params;
  
  let endpoint: string;
  const apiParams: Record<string, string> = {
    market: marketCode,
    count
  };
  
  if (time === 'minutes') {
    if (!timeCnt) {
      throw new Error('timeCnt parameter is required for minutes');
    }
    endpoint = `candles/${time}/${timeCnt}`;
  } else {
    endpoint = `candles/${time}`;
  }
  
  if (datetime) {
    apiParams.to = datetime;
  }
  
  return callUpbitAPI(endpoint, apiParams);
};

// 기존 getCoin 객체와 호환되는 인터페이스
export const getCoin = {
  getCandles: async ({ marketCode, time, timeCnt }: {
    marketCode: string;
    time: string;
    timeCnt: number | null;
  }) => {
    const data = await getCandles({ marketCode, time, timeCnt });
    return { data };
  },

  getAdditionCandles: async ({ marketCode, time, timeCnt, datetime }: {
    marketCode: string;
    time: string;
    timeCnt: number | null;
    datetime: string;
  }) => {
    const data = await getCandles({ marketCode, time, timeCnt, datetime });
    return { data };
  }
}; 