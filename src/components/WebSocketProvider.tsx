"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/store/marketStore";

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This effect runs once when the app mounts
    const { connect, ws, isConnecting } = useMarketStore.getState();
    if (!ws && !isConnecting) {
      connect();
    }

    // This cleanup function runs once when the app unmounts
    return () => {
      const { disconnect } = useMarketStore.getState();
      disconnect();
    };
  }, []);

  return <>{children}</>;
} 