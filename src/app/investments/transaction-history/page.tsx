'use client';

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarketListCompoenet from "@/components/MarketListComponent";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import {ko} from "date-fns/locale"
import { useMarketStore } from "@/store/marketStore";
import { useAssetStore, TradeHistory } from "@/store/assetStore";





export default function TransactionHistoryPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("1개월")
  const [transactionType, setTransactionType] = useState("전체")
  const periods = ["1주일", "1개월", "3개월", "6개월", "직접입력"]
  const transactionTypes = ["전체", "매수", "매도"]
  const [activeTab, setActiveTab] = useState("거래내역");
  const [periodTrade, setPeriodTrade] = useState<TradeHistory[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [default_sTime, setDefaultStart] = useState(new Date());
  const [default_eTime, setDefaultEnd] = useState(new Date(default_sTime.getTime() - 30 * 24 * 60 * 60 * 1000 ));
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [calenderStart, calenderEnd] = dateRange;
  const { tickers, markets } = useMarketStore();
  const { tradeHistory: allTradeHistory } = useAssetStore();
  const [ checkMonth, setCheckMonth ] = useState(false);
  const [ monthInfo, setMonthInfo ] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = ["거래내역", "미체결"];

  const setPeriod = (period: string) => {
    setSelectedPeriod(period);
    if (period === '1주일') {
      setDefaultStart(new Date());
      setDefaultEnd(new Date(default_sTime.getTime() - 7 * 24 * 60 * 60 * 1000 ))
      setShowPicker(false);
    }
    else if (period === '1개월') {
      setDefaultStart(new Date());
      setDefaultEnd(new Date(default_sTime.getTime() - 30 * 24 * 60 * 60 * 1000 ))
      setShowPicker(false);
    }
    else if (period === '3개월') {
      setDefaultStart(new Date());
      setDefaultEnd(new Date(default_sTime.getTime() - 90 * 24 * 60 * 60 * 1000 ))
      setShowPicker(false)
    }
    else if (period === '6개월') {
      setDefaultStart(new Date());
      setDefaultEnd(new Date(default_sTime.getTime() - 180 * 24 * 60 * 60 * 1000 ))
      setShowPicker(false)
    }
    else if (period === '직접입력') {
      setShowPicker(!showPicker)
      setDateRange([new Date(), new Date()])
    };
  }

  const handleTabChange = (tab: string) => {
    if (tab === "미체결") {
      router.push('/investments/wait-orders');
    } else {
      router.push('/investments/transaction-history');
    }
  };

  const toDateOnly = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const getTradeHistory = async () => {
    
    const end = toDateOnly(default_eTime);
    const start = toDateOnly(default_sTime);

    const period_items = allTradeHistory.filter((item: TradeHistory) => {
      const time = toDateOnly(new Date(item.concludedAt));

      if (transactionType === '전체') {
        return end <= time && time <= start;
      } else if (transactionType === '매수') {
        return (end <= time && time <= start) && item.orderPosition === 'BUY';
      } else {
        return (end <= time && time <= start) && item.orderPosition === 'SELL';
      }
    })

    setPeriodTrade(period_items);
  }

  const handleDateChange = (dates:[Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange(dates)

    
    
    if (start && end) {
      const diff = Math.abs((start.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));

      if (diff > 180) {
        setCheckMonth(true);
        setMonthInfo('최대 6개월까지만 선택할 수 있습니다.');
        setDateRange([new Date(), new Date()]);
        return;
      } else {
        setDefaultStart(end ?? default_sTime);
        setDefaultEnd(start ?? default_eTime);
      }
    }
  } 

  useEffect(() => {
    getTradeHistory();
  }, [transactionType, selectedPeriod, default_eTime, default_sTime, allTradeHistory]);

  const filterData = periodTrade.filter((item) => {
    if (searchTerm.length === 0) return periodTrade;

    const term = searchTerm.toLowerCase();

    const koreanMarket = markets.filter((item) => item.korean_name.toLowerCase().includes(term))

    return (
      item.marketCode.toLowerCase().includes(term) ||
      koreanMarket.some(m => m.market.toLowerCase() === item.marketCode.toLocaleLowerCase())
    )
  });

  const onSearch = () => {
    const term = inputRef.current?.value || '';
    setSearchTerm(term);
  }

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Left section - 2/3 width (2 columns) */}
      <div className="col-span-2 flex flex-col gap-2">
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="w-full max-w-6xl mx-auto p-4 bg-white">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
              {showPicker && (
                <div className="absolute left-[450px] top-[180px] z-[9999] mt-2 bg-white p-3 rounded shadow-md">
                  <DatePicker
                    locale={ko}
                    maxDate={new Date()}
                    selected={calenderStart}
                    onChange={handleDateChange}
                    startDate={calenderStart}
                    endDate={calenderEnd}
                    selectsRange={true}
                    dateFormat={'yyyy-MM-dd'}
                    inline
                  ></DatePicker>

                  <div className="mt-2 text-right grid-cols-2">
                    {checkMonth &&
                    <p className="text-xs text-red-600 mb-2">{monthInfo}</p>
                    }
                    <button onClick={() => {
                      setShowPicker(false);
                      setCheckMonth(false);
                    }}
                     className="px-3 py-1 text-xs border rounded bg-blue-50 border-blue-300 text-blue-600" >
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date and Filter Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">기간</span>
                <span className="text-sm text-gray-500">{`${format(default_eTime, 'yyyy.MM.dd')} - ${format(default_sTime, 'yyyy.MM.dd')}`}</span>
                <div className="flex space-x-2">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setPeriod(period)}
                      className={`px-3 py-1 text-xs border rounded ${
                        selectedPeriod === period
                          ? "bg-blue-50 border-blue-300 text-blue-600"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                  {}
                </div>
              </div>
            </div>

            {/* Transaction Type and Search */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">종류</span>
                <div className="flex space-x-2">
                  {transactionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTransactionType(type)}
                      className={`px-3 py-1 text-xs border rounded ${
                        transactionType === type
                          ? "bg-blue-50 border-blue-300 text-blue-600"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">검색 </span>
                <div className="relative">
                  <Input ref={inputRef} placeholder="코인명/심볼검색" className="w-48 pr-8" onChange={onSearch} />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" onClick={onSearch} />
                </div>
              </div>
            </div>

            {/* Transaction Table */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          체결시간
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          코인
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          마켓
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          종류
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          거래수량
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          거래단가
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          거래금액
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          수수료
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          정산금액
                        </th>
                        <th className="text-center px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          주문시간
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filterData.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                              거래내역이 없습니다.
                            </td>
                          </tr>
                        
                        ):
                        filterData.map((history, idx) => {
                          return (
                           <tr key={idx} className="">
                            <td className="text-center text-gray-500 text-xs py-3">{format(new Date(history.concludedAt), 'yyyy.MM.dd hh:mm')}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{history.marketCode.split('-')[1]}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{history.marketCode.split('-')[0]}</td>
                            <td id="orderPosition" className={`text-center text-xs py-3 ${history.orderPosition === "BUY"?"text-blue-600":"text-red-600"}`}>{history.orderPosition}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{history.tradeQuantity}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{(history.tradePrice / history.tradeQuantity).toFixed(2)}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{history.tradePrice}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{(history.tradePrice * 0.0005).toFixed(2)}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{(history.tradePrice + (history.tradePrice * 0.0005)).toFixed(2)}</td>
                            {/* 주문시간은 api에 없어서 체결시간으로 대체 */}
                            <td className="text-center text-gray-500 text-xs py-3">{format(new Date(history.concludedAt), 'yyyy.MM.dd hh:mm')}</td>
                          </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right section - 1/3 width (1 column) */}
      <div className="relative col-span-1">
        <MarketListCompoenet></MarketListCompoenet>
      </div>
    </main>
  )
}