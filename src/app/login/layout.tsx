import type { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
