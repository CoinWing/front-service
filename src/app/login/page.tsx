'use client';

import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const handleSwitch = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-md">
        <LoginForm onSwitch={handleSwitch} />
      </div>
    </div>
  );
}
