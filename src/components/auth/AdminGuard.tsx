"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminGuardProps } from '@/types/auth';

/**
 * 관리자 권한이 있는 사용자만 접근할 수 있도록 하는 컴포넌트
 * @param children 관리자일 때 표시할 컴포넌트
 * @param fallback 관리자가 아닐 때 표시할 컴포넌트 (기본값: 404 페이지로 리다이렉트)
 */
export default function AdminGuard({ children, fallback }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 세션 로딩이 완료되고 로그인되지 않았거나 관리자가 아닌 경우
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const isAdmin = (session.user as any).superAdmin || false;
      
      if (!isAdmin) {
        if (fallback) {
          // fallback 컴포넌트가 있으면 표시
          return;
        } else {
          // fallback이 없으면 404 페이지로 리다이렉트
          router.push('/404');
          return;
        }
      }
    }
  }, [session, status, router, fallback]);

  // 세션 로딩 중
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않음
  if (status === 'unauthenticated') {
    return null; // 리다이렉트 처리 중
  }

  // 로그인되었지만 관리자가 아님
  if (status === 'authenticated' && session?.user) {
    const isAdmin = (session.user as any).superAdmin || false;
    
    if (!isAdmin) {
      if (fallback) {
        return <>{fallback}</>;
      } else {
        return null; // 리다이렉트 처리 중
      }
    }
  }

  // 관리자인 경우 children 렌더링
  return <>{children}</>;
} 