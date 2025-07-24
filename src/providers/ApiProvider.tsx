'use client';

import { useEffect, useRef, useState } from 'react';
import { useAssetStore } from '@/store/assetStore';

export default function ApiProvider() {
  const { fetchTradeHistory, fetchPortfolio, fetchPending } = useAssetStore();
  // 중복 fetch 방지
  const hasFetchedRef = useRef<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const isAuthenticated = parsed.state?.isAuthenticated;
      console.log('isAuthenticated: ', isAuthenticated);
      if (!isAuthenticated || hasFetchedRef.current) return;
      fetchTradeHistory();
      fetchPortfolio();
      fetchPending();
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Failed to Parsing: ', err);
    }
  }, []);

  return null;
}