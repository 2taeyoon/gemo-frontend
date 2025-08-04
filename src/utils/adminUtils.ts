import { useSession } from 'next-auth/react';

/**
 * 클라이언트 사이드에서 관리자 권한을 확인하는 훅
 * @returns 관리자 권한이 있으면 true, 없으면 false
 */
export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return false;
  }
  
  return (session.user as any).superAdmin || false;
}

/**
 * 관리자 권한이 없을 때 표시할 컴포넌트를 렌더링하는 함수
 * @param isAdmin 관리자 권한 여부
 * @param adminComponent 관리자일 때 표시할 컴포넌트
 * @param fallbackComponent 관리자가 아닐 때 표시할 컴포넌트
 * @returns 조건에 맞는 컴포넌트
 */
export function renderWithAdminCheck<T>(
  isAdmin: boolean,
  adminComponent: T,
  fallbackComponent: T
): T {
  return isAdmin ? adminComponent : fallbackComponent;
}

/**
 * 관리자 권한이 없을 때 404 페이지로 리다이렉트하는 함수
 * @param isAdmin 관리자 권한 여부
 */
export function redirectIfNotAdmin(isAdmin: boolean): void {
  if (!isAdmin) {
    // 404 페이지로 리다이렉트
    window.location.href = '/404';
  }
} 