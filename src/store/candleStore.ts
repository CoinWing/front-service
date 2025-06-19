import { create } from 'zustand';
import { getCoin } from '../api/api.js';

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
    selected_market: string;
    selected_time: Selected_time;
    timeUnit: string;

    fetchCandles: () => Promise<void>;
    fetchAdditionCandles: () => Promise<void>;
    set_selectedMarket: (selected_market: string) => Promise<void>;
    set_selectedTime: (time: string, cnt: number | null) => Promise<void>
    set_timeUnit: (timeUnit: string) => Promise<void>
}

export const useCandleStore = create<CandleStoreState>((set, get) => ({
    candles: [],
    error: null,
    selected_market: 'KRW-BTC',
    selected_time: { time: 'minutes', cnt: 30 },
    timeUnit: 'hour',


    fetchCandles: async () => {
        
        const market_code = get().selected_market;
        const { time, cnt } = get().selected_time;
        
        set({ error: null });
        try {
            const response = await getCoin.getCandles({ marketCode: market_code, time: time, timeCnt: cnt });
            if (!response || !response.data) {
                throw new Error("No data received from API");
            }

            // candle 데이터 형식에 맞게 변환
            const candles = response.data.map((candle: any) => ({
                x: new Date(candle.candle_date_time_kst).getTime(),
                o: candle.opening_price,
                h: candle.high_price,
                l: candle.low_price,
                c: candle.trade_price,
            }));
            set({ candles });
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    set_selectedMarket: async (market: string) => {
        set({ selected_market: market });
    },

    set_selectedTime: async (time: string, cnt: number | null) => {
        set({ selected_time: { time, cnt } });
    },

    set_timeUnit: async (timeUnit: string) => {
        set({ timeUnit: timeUnit });
    },

    fetchAdditionCandles: async () => {

        const market_code = get().selected_market;
        const { time, cnt } = get().selected_time;
        const week = Date.now() - 7 * 24 * 60 * 60 * 1000;

        let allCandles: Candle[] = [];
        let toDatetime = new Date().toISOString();

        set ({ error: null });

        try {
            while(true) {
                const response = await getCoin.getAdditionCandles({
                    marketCode: market_code,
                    time: time,
                    timeCnt: cnt,
                    datetime: toDatetime,
                });

                if (!response || response.data) break;

                const candles = response.data.map((candle: any) => ({
                    x: new Date(candle.candle_date_time_kst).getTime(),
                    o: candle.opening_price,
                    h: candle.high_price,
                    l: candle.low_price,
                    c: candle.trade_price,
                }));

                allCandles = [...allCandles, ...candles];

                // 가장 오래된 데이터 시간
                const oldtime = candles[candles.length - 1];
                toDatetime = new Date(oldtime.x).toISOString();

                if (oldtime.x < week) break;

                if (candles.length < 200) break;
            }



            const currentCandles = get().candles;
            const updateCandles = [...currentCandles, ...allCandles];

            // 중복 제거 및 정렬
            const resultCandles = Array.from(
                new Map(updateCandles.map((c) => [c.x, c])).values()
            );


            set({ candles: resultCandles });

            console.log(get().candles, '후...')
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message: String(error) });
        }
    },
}));