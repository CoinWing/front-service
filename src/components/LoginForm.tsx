'use client';

import { useState } from 'react';

type LoginFormProps = {
  onSwitch?: () => void;
};

export default function LoginForm({ onSwitch }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const user = await res.json();
      alert(`${user.nickname}님 환영합니다!`);
      // TODO: 로그인 상태 저장, 리다이렉트 등
    } catch (err: any) {
      alert('로그인 실패: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-left">로그인</h2>
      <input
        type="email"
        placeholder="이메일 주소를 입력해주세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="p-2 border rounded w-96"
      />
      <input
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="p-2 border rounded w-96"
      />
      <button
        type="submit"
        className="bg-blue-900 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        로그인
      </button>
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
