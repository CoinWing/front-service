"use client"

import { Search, Settings } from "lucide-react"

export default function SearchBar() {
  return (
    <div className="flex w-full border rounded-md overflow-hidden">
      <div className="flex-1">
        <input type="text" placeholder="코인명/심볼검색" className="w-full px-4 py-2 outline-none" />
      </div>
      <button className="px-3 bg-white border-l">
        <Search className="h-5 w-5 text-blue-600" />
      </button>
      <button className="px-3 bg-white border-l">
        <Settings className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  )
}
