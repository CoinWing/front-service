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

    fetchCandles: (marketCode: string, time: string, timeCnt: number) => Promise<void>;
    set_selectedMarket: (selected_market: string) => Promise<void>;
    set_selectedTime: (time: string, cnt: number | null) => Promise<void>
}

export const useCandleStore = create<CandleStoreState>((set) => ({
    candles: [],
    error: null,
    selected_market: 'KRW-BTC',
    selected_time: { time: 'minutes', cnt: 30 },


    fetchCandles: async (marketCode, time, timeCnt) => {
        set({ error: null });
        try {
            const response = await getCoin.getCandles({ marketCode, time, timeCnt });
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
    }
}));