'use client';

import SignupForm from '@/components/SignupForm';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  const handleSwitch = () => {
    router.push('/login'); // 로그인 페이지로 이동
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-md" >
        <SignupForm onSwitch={handleSwitch} />
      </div>
    </div>
  );
}
