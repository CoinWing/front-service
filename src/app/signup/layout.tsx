import type { ReactNode } from 'react';

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
