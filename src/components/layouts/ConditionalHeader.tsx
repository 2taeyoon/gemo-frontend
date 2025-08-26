"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

/**
 * 조건부 헤더 컴포넌트
 * 정의된 경로에서만 헤더를 표시합니다. (화이트리스트 방식)
 */
export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // 헤더를 표시할 경로들 (실제 존재하는 페이지들)
  const showHeaderPaths = [
    '/',           // 홈 페이지
    '/auth',       // 로그인 페이지  
    '/kodle',      // 코들 게임 페이지
    '/mypage',     // 마이페이지
  ];
  
  // 현재 경로가 헤더를 표시해야 하는 경로인지 확인
  const shouldShowHeader = showHeaderPaths.includes(pathname);
  
  if (!shouldShowHeader) {
    return null;
  }
  
  return <Header />;
}
