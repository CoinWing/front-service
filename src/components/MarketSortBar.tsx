"use client"

export default function MarketSortBar() {
  return (
    <div className="flex w-full text-sm text-gray-600 border-b py-2">
      <div className="flex-1 flex items-center px-2">한글명(심볼)</div>
      <div className="flex-1 flex items-center justify-end px-2">현재가</div>
      <div className="flex-1 flex items-center justify-end px-2">전일대비</div>
      <div className="flex-1 flex items-center justify-end px-2 pr-8">거래대금</div>
    </div>
  )
}
