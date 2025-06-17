import CandleChart from "@/components/CandleChart"

export default function PriceListPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Chart</h1>
      <div className="grid gap-8">
        <CandleChart />
      </div>
    </main>
  )
} 