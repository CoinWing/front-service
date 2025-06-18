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
}

export interface MarketState {
  orderbooks: { [key: string]: OrderbookData }; // 주문 테이블
  selectedMarket: string; // 선택된 마켓
  isLoading: boolean; // 로딩 상태
  error: string | null; // 에러 메시지
  currentPrice: number | null; // 현재 가격
  connect: () => void; // 웹소켓 연결
  disconnect: () => void; // 웹소켓 연결 해제
  setSelectedMarket: (market: string) => void; // 선택된 마켓 설정
} 