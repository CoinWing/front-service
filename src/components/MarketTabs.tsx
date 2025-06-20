"use client"

import { useState } from "react"

export default function MarketTabs() {
  const [activeTab, setActiveTab] = useState("원화")

  const tabs = [
    { id: "원화", label: "원화" },
  ]

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-6 py-3 font-medium ${
            activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-700"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
