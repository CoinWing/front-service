export interface OrderbookUnit {
  ask_price: number; // 매도 가격
  bid_price: number; // 매수 가격
  ask_size: number; // 매도 수량
  bid_size: number; // 매수 수량
}

export interface OrderbookData {
  market: string; // 마켓 종류
  code: string; // 종목 코드
  orderbook_units: OrderbookUnit[]; // 주문 테이블
  timestamp: number; // 최근 체결 시각
  total_ask_size: number; // 총 매도 잔량
  total_bid_size: number; // 총 매수 잔량
  type: string; // 타입
}

export interface TickerData {
  type: string; // 타입
  code: string; // 종목 코드
  trade_price: number; // 현재가
  signed_change_price: number; // 전일대비 가격
  signed_change_rate: number; // 전일대비 비율
  acc_trade_volume_24h: number; // 24시간 누적 거래량
  acc_trade_price_24h: number; // 24시간 누적 거래대금
  high_price: number; // 고가
  low_price: number; // 저가
  prev_closing_price: number; // 전일 종가
  trade_volume: number; // 거래량
  timestamp: number; // 최근 체결 시각
  acc_ask_volume: number; // 누적 매도 거래량
  acc_bid_volume: number; // 누적 매수 거래량
}

export interface TradeData {
  type: string; // 타입
  code: string; // 종목 코드
  trade_price: number; // 현재가
  trade_volume: number; // 거래량
  ask_bid: 'ASK' | 'BID'; // 매도/매수
  trade_timestamp: number; // 체결 시각
  timestamp: number; // 최근 체결 시각
}

export interface MarketInfo {
  market: string; // 마켓 종류 (KRW-BTC, KRW-ETH, KRW-XRP 등)
  korean_name: string; // 한글 이름
  english_name: string; // 영어 이름
  market_warning: string; // 경고 메시지
}

export interface MarketState {
  tickers: Record<string, TickerData>; // 티커 데이터
  orderbooks: Record<string, OrderbookData>; // 주문 테이블 데이터
  selectedMarket: string; // 선택된 마켓
  isLoading: boolean; // 로딩 상태
  error: string | null; // 에러 메시지
  currentPrice: number | null; // 현재 가격
  ws: WebSocket | null; // WebSocket 연결
  subscribedMarkets: Set<string>; // 구독 중인 마켓
  tradeData: Record<string, TradeData[]>; // 거래 데이터
  markets: MarketInfo[]; // 마켓 정보
  connect: () => Promise<void>; // WebSocket 연결
  disconnect: () => void; // WebSocket 연결 해제
  setSelectedMarket: (market: string) => void; // 선택된 마켓 설정
  initializeMarkets: () => Promise<MarketInfo[]>; // 마켓 정보 초기화
  loadInitialTickers: () => Promise<Record<string, TickerData>>; // 초기 시세 데이터 로드
} 