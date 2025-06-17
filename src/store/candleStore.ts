import { create } from 'zustand';
import { getCoin } from '../api/api.js';

interface Candle {
    x: number; // 시간 timestamp
    o: number; // 시가
    h: number; // 고가
    l: number; // 저가
    c: number; // 종가
}

interface CandleStoreState {
    candles: Candle[];
    error: string | null;
    fetchCandles: (marketCode: string, time: string, timeCnt: number) => Promise<void>;
}

export const useCandleStore = create<CandleStoreState>((set) => ({
    candles: [],
    error: null,

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
    }
}));