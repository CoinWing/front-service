'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  
  // 로그인 상태 확인용 state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 예: localStorage에 'token'이 있으면 로그인 상태로 간주
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]); // 경로가 바뀔 때마다 확인


  // 로그아웃 함수
  const handleLogout = () => {
    localStorage.removeItem('token');  // 토큰 삭제
    setIsLoggedIn(false);
    // 로그아웃 후 홈으로 이동하거나 새로고침 등 추가 작업 가능
    window.location.href = '/'; // 간단하게 홈으로 이동
  };

  return (
    <nav className="border-b bg-blue-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽 */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold hover:text-gray-300">
              CoWing
            </Link>
            <Link href="/exchange" className="hover:text-gray-300">
              모의거래소
            </Link>
            <Link href="/" className="hover:text-gray-300">
              투자내역
            </Link>
            <Link href="/" className="hover:text-gray-300">
              보유자산
            </Link>
          </div>

          {/* 오른쪽 */}
          <div className="flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {/* 로그인 상태일 때 */}
                <button
                  onClick={handleLogout}
                  className="hover:text-gray-300 cursor-pointer"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                {/* 비로그인 상태일 때 */}
                <Link href="/login" className="hover:text-gray-300">
                  로그인
                </Link>
                <Link href="/signup" className="hover:text-gray-300">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
