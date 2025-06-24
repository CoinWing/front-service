"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMarketStore } from "@/store/marketStore";

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInitialized = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 앱이 처음 마운트될 때만 웹소켓 연결
    if (!isInitialized.current) {
      const { connect, ws, isConnecting } = useMarketStore.getState();
      if (!ws && !isConnecting) {
        console.log('Initializing WebSocket connection...');
        connect();
      }
      isInitialized.current = true;
    }
  }, []);

  // 페이지 이동 시 웹소켓 연결 상태 확인 (재연결 로직 제거)
  useEffect(() => {
    const { ws, isConnecting } = useMarketStore.getState();
    
    // 웹소켓이 완전히 끊어져 있고 연결 중이 아닌 경우에만 로그 출력
    if (!ws && !isConnecting) {
      console.log('WebSocket disconnected, but not attempting to reconnect automatically');
    }
  }, [pathname]);

  // 앱이 완전히 언마운트될 때만 웹소켓 연결 해제
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return <>{children}</>;
} 