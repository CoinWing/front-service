import { create } from 'zustand';
import { getCoin } from '@/lib/upbitApi';

// TimeUnit 타입 정의 추가
type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface Candle {
    x: number; // 시간 timestamp
    o: number; // 시가
    h: number; // 고가
    l: number; // 저가
    c: number; // 종가
}

interface Selected_time {
    time: string;
    cnt: number | null;
}

interface CandleStoreState {
    candles: Candle[];
    error: string | null;
    selected_time: Selected_time;
    timeUnit: TimeUnit; // string에서 TimeUnit으로 변경
    lastFetchTime: number; // 마지막 데이터 가져온 시간
    isFetching: boolean; // 데이터 가져오는 중인지 확인
    currentMarket: string; // 현재 선택된 마켓

    fetchAdditionCandles: (market: string) => Promise<void>;
    set_selectedTime: (time: string, cnt: number | null) => Promise<void>
    set_timeUnit: (timeUnit: TimeUnit) => Promise<void> // 매개변수 타입도 변경
}

async function delay(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useCandleStore = create<CandleStoreState>((set, get) => ({
    candles: [],
    error: null,
    selected_time: { time: 'minutes', cnt: 30 },
    timeUnit: 'hour' as TimeUnit, // 타입 단언 추가
    lastFetchTime: 0,
    isFetching: false,
    currentMarket: '',

    fetchAdditionCandles: async (market: string) => {
        const state = get();
        
        // 이미 데이터를 가져오는 중이면 중복 요청 방지
        if (state.isFetching) {
            return;
        }

        const { time, cnt } = state.selected_time;

        // 마켓이 변경되었으면 캐시 무효화
        if (state.currentMarket !== market) {
            set({ 
                currentMarket: market,
                candles: [],
                lastFetchTime: 0,
                isFetching: true,
                error: null 
            });
        } else {
            // 캐시된 데이터가 있고, 3분 이내에 같은 마켓/시간으로 요청했다면 캐시 사용
            const now = Date.now();
            if (state.candles.length > 0 && 
                now - state.lastFetchTime < 180000) {
                return;
            }
        }

        // 로딩 상태가 아직 설정되지 않았다면 설정
        if (!state.isFetching) {
            set({ isFetching: true, error: null });
        }

        try {
            let allCandles: Candle[] = [];
            let toDatetime = new Date().toISOString();

            let call_cnt = 0;
            const maxCalls = 3; // API 호출 횟수 제한

            while(call_cnt < maxCalls) {
                const response = await getCoin.getAdditionCandles({
                    marketCode: market,
                    time: time,
                    timeCnt: cnt,
                    datetime: toDatetime,
                });

                if (!response || !response.data || response.data.length === 0) {
                    break;
                }

                const candles = response.data.map((candle: any) => ({
                    x: new Date(candle.candle_date_time_kst).getTime(),
                    o: candle.opening_price,
                    h: candle.high_price,
                    l: candle.low_price,
                    c: candle.trade_price,
                }));

                allCandles = [...allCandles, ...candles];

                // 가장 오래된 데이터 시간
                const oldtime = candles[0];
                toDatetime = new Date(oldtime.x).toISOString();
                call_cnt += 1;

                // API 호출 간격 단축
                await delay(50);
            }

            // 시간 옵션이 변경된 경우 기존 데이터를 완전히 교체
            const currentCandles = get().candles;
            let resultCandles: Candle[];
            
            // 같은 마켓이고 시간 옵션이 같으면 기존 데이터와 병합
            if (currentCandles.length > 0 && 
                currentCandles[0] && 
                Math.abs(currentCandles[0].x - allCandles[0]?.x) < 60000) { // 1분 이내 차이
                
                const updateCandles = [...currentCandles, ...allCandles];
                
                // 중복 제거 및 정렬 (성능 최적화)
                const candleMap = new Map();
                
                // 기존 데이터 먼저 추가
                currentCandles.forEach(candle => {
                    candleMap.set(candle.x, candle);
                });
                
                // 새 데이터로 덮어쓰기 (최신 데이터 우선)
                allCandles.forEach(candle => {
                    candleMap.set(candle.x, candle);
                });
                
                resultCandles = Array.from(candleMap.values())
                    .sort((a, b) => a.x - b.x);
            } else {
                // 시간 옵션이 변경되었거나 다른 마켓인 경우 새 데이터로 교체
                resultCandles = allCandles.sort((a, b) => a.x - b.x);
            }

            set({ 
                candles: resultCandles, 
                lastFetchTime: Date.now(),
                isFetching: false 
            });

        } catch (error: unknown) {
            set({ 
                error: error instanceof Error ? error.message : String(error),
                isFetching: false 
            });
        }
    },

    set_selectedTime: async (time: string, cnt: number | null) => {
        // 시간 옵션이 변경되면 캐시 무효화
        set({ 
            selected_time: { time, cnt },
            lastFetchTime: 0, // 캐시 무효화
            candles: [] // 기존 데이터 초기화
        });
    },

    set_timeUnit: async (timeUnit: TimeUnit) => { // 매개변수 타입 변경
        set({ timeUnit: timeUnit });
    },
}));