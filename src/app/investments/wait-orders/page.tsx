"use client"

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MarketListComponent from "@/components/MarketListComponent";
import { apiClient } from "@/lib/apiClient";
import { useAssetStore } from "@/store/assetStore";

type PendingOrder = {
  uuid: string;
  marketCode: string;
  orderType: string;
  orderPosition: string;
  orderPrice: number;
  totalQuantity: number;
  orderRequestedAt: number;
};

export default function WaitOrders() {
  const router = useRouter();
  const [orderType, setOrderType] = useState("전체주문");
  const [activeTab, setActiveTab] = useState("미체결");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set()); // 선택된 주문 ID를 추적하는 Set
  const { pendingInfo } = useAssetStore();

  const tabs = ["거래내역", "미체결"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "거래내역") {
      router.push('/investments/transaction-history');
    } else {
      router.push('/investments/wait-orders');
    }
  };

  // 주문 유형별 필터링 (전체, 매수, 매도)
  const filteredOrders = pendingInfo.filter(order => {
    if (orderType === "전체주문") return true;
    if (orderType === "매수주문") return order.orderPosition === "BUY";
    if (orderType === "매도주문") return order.orderPosition === "SELL";
    return true;
  });

  // 체크박스를 클릭할 때의 동작
  const handleSelectOrder = (id: string) => {
    const newSelectedOrders = new Set(selectedOrders);
    if (newSelectedOrders.has(id)) {
      newSelectedOrders.delete(id);
    } else {
      newSelectedOrders.add(id);
    }
    setSelectedOrders(newSelectedOrders);
  };

  // 일괄 취소 버튼 클릭 시
  const handleCancelSelectedOrders = () => {
    console.log("취소할 주문들: ", Array.from(selectedOrders));

    // Reset the selected orders set
    setSelectedOrders(new Set());
  };

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="col-span-2 flex flex-col gap-2">
        <div className="border rounded-md overflow-hidden bg-white">
          <div className="w-full max-w-6xl mx-auto p-4 bg-white">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Order Type and Cancel All */}
            <div className="flex items-center justify-between">
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체주문">전체주문</SelectItem>
                  <SelectItem value="매수주문">매수주문</SelectItem>
                  <SelectItem value="매도주문">매도주문</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={handleCancelSelectedOrders}
              >
                일괄취소
              </Button>
            </div>

            {/* Pending Orders Table */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders(new Set(filteredOrders.map(order => order.uuid)));
                              } else {
                                setSelectedOrders(new Set());
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문시간</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문종류</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">거래종목</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">거래단가</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문금액</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">주문수량</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">미체결량</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                            거래내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((pendingorder) => (
                          <tr key={pendingorder.uuid}>
                            <td className="px-4 py-2">
                              <input
                                id={pendingorder.uuid}
                                type="checkbox"
                                checked={selectedOrders.has(pendingorder.uuid)}
                                onChange={() => handleSelectOrder(pendingorder.uuid)}
                              />
                            </td>
                            <td className="text-center text-gray-500 text-xs py-3">{format(pendingorder.orderRequestedAt, "yyyy-MM-dd HH:mm:ss")}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{pendingorder.orderPosition}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{pendingorder.marketCode}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{pendingorder.orderPrice.toLocaleString()}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{Math.floor(pendingorder.orderPrice * pendingorder.totalQuantity).toLocaleString()}</td>
                            <td className="text-center text-gray-500 text-xs py-3">{pendingorder.totalQuantity}</td>
                            {/* 미체결량 API 개선되면 반영 필요 */}
                            <td className="text-center text-gray-500 text-xs py-3">{pendingorder.totalQuantity}</td>
                          </tr>
                        ))
                      )}
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
        <MarketListComponent />
      </div>
    </main>
  );
}