import { NextResponse } from 'next/server';

const UPBIT_API_URL = 'https://api.upbit.com/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint parameter is required' },
        { status: 400 }
      );
    }
    
    // 쿼리 파라미터들을 UpBit API로 전달
    const queryParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${UPBIT_API_URL}/${endpoint}?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from UpBit API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 특정 엔드포인트에 대한 데이터 가공
    if (endpoint === 'market/all') {
      // KRW 마켓만 필터링
      const krwMarkets = data.filter((market: any) => market.market.startsWith('KRW-'));
      return NextResponse.json(krwMarkets);
    }
    
    if (endpoint.startsWith('candles/')) {
      // 캔들 데이터 정렬
      const sortedCandles = data.sort((a: any, b: any) => a.timestamp - b.timestamp);
      return NextResponse.json(sortedCandles);
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in UpBit proxy:', error);
    return NextResponse.json(
      { error: 'UpBit API 요청에 실패했습니다.' },
      { status: 500 }
    );
  }
} 