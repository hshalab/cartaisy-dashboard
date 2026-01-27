import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] overscroll-none">
      {children}
    </div>
  );
}
