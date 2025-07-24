'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/apiClient';
import { useAssetStore } from '@/store/assetStore';

type LoginFormProps = {
  onSwitch?: () => void;
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [username, setUserName] = useState('');
  const [passwd, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const { fetchPortfolio, fetchTradeHistory, fetchPending } = useAssetStore();

  const [ checkLogin, setCheckLogin ] = useState(false); // 로그인 실패 확인 변수
  const [ loginInfo, setLoginInfo ] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, passwd);
      if (result.success) {
        router.push('/'); // 메인 페이지로 리다이렉트
        fetchPortfolio();
        fetchTradeHistory();
        fetchPending();

        try {
          const result = await apiClient.userInfo();
          setUser({email: result.email, nickname: result.nickname, username: result.username});
        } catch (err: any) {
          console.error('API ERROR: ' + err.meesage);
        }
      } else {
        setCheckLogin(true);
        setLoginInfo(result.message);
      }
    } catch (err: any) {
      console.error('로그인 실패: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-left">로그인</h2>
      <input
        type="text"
        placeholder="사용자 이름을 입력해주세요"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
        required
        disabled={isLoading}
        className="p-2 border rounded w-96"
      />
      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={passwd}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        className="p-2 border rounded w-96"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-900 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
      {checkLogin && 
      <p className="text-sm text-center text-red-600">{loginInfo}</p>
      }
      {onSwitch && (
        <p
          onClick={onSwitch}
          className="text-sm text-center text-blue-600 hover:underline cursor-pointer"
        >
          계정이 없으신가요? 회원가입
        </p>
      )}
    </form>
  );
}
