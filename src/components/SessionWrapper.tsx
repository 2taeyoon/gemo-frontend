"use client";

import { SessionProvider } from 'next-auth/react';

// NextAuth SessionProvider를 감싸는 클라이언트 컴포넌트
export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 