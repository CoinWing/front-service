import axios from "axios";

export const getCoin = {
    getCandles: ({ marketCode, time, timeCnt }) => {

        if (time == 'minutes') {
            return axios
                .get(
                    `https://api.upbit.com/v1/candles/${time}/${timeCnt}?market=${marketCode}&count=200`
                )
                .then((res) => {
                    return {
                        ...res,
                        data: res.data.sort((a, b) => a.timestap - b.timestamp),
                    };
                });
        } else {
            return axios
                .get(
                    `https://api.upbit.com/v1/candles/${time}?market=${marketCode}&count=200`
                )
                .then((res) => {
                    return {
                        ...res,
                        data: res.data.sort((a, b) => a.timestamp - b.timestamp),
                    };
                });
        }
    }
}