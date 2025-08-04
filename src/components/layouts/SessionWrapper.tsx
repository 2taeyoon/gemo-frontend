"use client";

import { SessionProvider } from 'next-auth/react';
import { SessionWrapperProps } from '@/types/auth';

// NextAuth SessionProvider를 감싸는 클라이언트 컴포넌트
export default function SessionWrapper({ children }: SessionWrapperProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
} 