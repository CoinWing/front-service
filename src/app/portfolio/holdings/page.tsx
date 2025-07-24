'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import TotalBuyCoin from '@/components/TotalBuyCoin';
import { useMarketStore } from '@/store/marketStore';
import { useAssetStore } from '@/store/assetStore';
import PortfolioCoin from '@/components/PortfolioCoin';
import HoldingCoinList from '@/components/HoldingCoinList';
import MarketListCompoenet from '@/components/MarketListComponent';

export type DoughnutData = {
  label: string;
  data: number;
};

export default function Holdings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("보유자산");

  const { tickers } = useMarketStore();
  const { assets, getDoughnutData, isLoading } = useAssetStore();

  const [doughnutData, setDoughnutData] = useState<DoughnutData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["보유자산", "투자손익"];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(tab === "보유자산" ? '/portfolio/holdings' : '/portfolio/profit-loss');
  };

  // assets 혹은 tickers 변경 시 도넛 데이터 재계산
  useEffect(() => {
    if (assets.length > 0 && Object.keys(tickers).length > 0) {
      const doughnut = getDoughnutData(assets, tickers);
      setDoughnutData(doughnut);
    }
  }, [assets, tickers, getDoughnutData]);

  if (isLoading) {
    return (
      <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
        <div className="col-span-2 border rounded-md overflow-hidden bg-white">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-500 border-t-transparent" />
          </div>
        </div>
        <div className="relative col-span-1">
          <MarketListCompoenet />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
        <div className="col-span-2 border rounded-md overflow-hidden bg-white">
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        </div>
        <div className="relative col-span-1">
          <MarketListCompoenet />
        </div>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-3 gap-2 min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="col-span-2 border rounded-md overflow-hidden bg-white">
        <div className="w-full max-w-6xl mx-auto pt-4 bg-white px-4 p-4">
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
          </div>
        </div>

        {activeTab === "보유자산" && (
          <div className="flex flex-col w-full max-w-6xl pl-4 bg-white">
            <TotalBuyCoin />

            <div className="mt-12">
              <p className="text-3xl text-center font-bold ">보유 코인 포트폴리오</p>

              <div className="flex flex-col md:flex-row md:flex-wrap p-4">
                <PortfolioCoin datas={doughnutData} />
              </div>
            </div>

            <HoldingCoinList />
          </div>
        )}
      </div>

      <div className="relative col-span-1">
        <MarketListCompoenet />
      </div>
    </main>
  );
}
