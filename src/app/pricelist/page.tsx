import { PriceList } from "@/components/PriceList"

export default function PriceListPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Price List</h1>
      <div className="grid gap-8">
        <PriceList />
      </div>
    </main>
  )
} 