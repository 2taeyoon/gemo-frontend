"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";


/**
 * 헤더 컴포넌트
 * 로고, 네비게이션, 사용자 정보, 레벨바를 표시합니다.
 */
export default function Header() {
  // 현재 경로와 세션 정보
  const pathname = usePathname() || "";
  const { data: session, status } = useSession();
  
  // 사용자 정보 (MongoDB에서 가져온 데이터)
  const { user, loading, updateThema } = useUser();

  // 다크모드 상태 관리 (로그인/로그아웃 상태 모두 고려)
  const [localDarkMode, setLocalDarkMode] = useState(false);
  
  // 로그인 상태에서는 user.thema를, 로그아웃 상태에서는 로컬 상태를 사용
  const darkMode = user ? user.thema === 'dark' : localDarkMode;

  /**
   * 다크모드 상태가 변경될 때마다 body 클래스를 업데이트합니다
   */
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  /**
   * 다크모드 토글 함수
   * 로그인 상태: DB에 저장
   * 로그아웃 상태: 로컬 상태만 변경
   */
  const toggleDarkMode = () => {
    if (user) {
      // 로그인 상태: DB에 저장
      const newThema = user.thema === 'light' ? 'dark' : 'light';
      updateThema(newThema);
    } else {
      // 로그아웃 상태: 로컬 상태만 변경
      setLocalDarkMode(prev => !prev);
    }
  };

  /**
   * 로그아웃 처리 함수
   */
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };


  // 헤더를 숨길 경로들
  const hideHeaderPaths = ['/not-found'];
  
  // 현재 경로가 헤더를 숨겨야 하는 경로인지 확인
  const shouldHideHeader = hideHeaderPaths.includes(pathname);
  
  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="header">
      <div className="header_container inner">

        {/* 네비게이션 메뉴 */}
        {status === "authenticated" && (
          <nav className="header_nav">
            <Link 
              href="/mypage" 
              style={{
                color: pathname === '/mypage' ? '#0070f3' : '#666',
                textDecoration: 'none',
                fontWeight: pathname === '/mypage' ? '600' : '400',
                fontSize: '14px',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: pathname === '/mypage' ? '#f0f8ff' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              마이페이지
            </Link>
          </nav>
        )}

        <div className="header_controls">
          {/* 로딩 상태 표시 */}
          {status === "loading" && (
            <span style={{ color: '#666' }}>로딩 중...</span>
          )}
          
          {/* 로그인된 사용자 정보 (메인 페이지가 아닐 때만 표시) */}
          {status === "authenticated" && session?.user && pathname !== '/' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginRight: '15px'
            }}>

              {/* 사용자 이메일 표시 */}
              <span>{session.user.email || session.user.name}님 환영합니다!</span>

              {/* 로그아웃 버튼 */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff4757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          )}

          {/* 로그인되지 않은 경우 로그인 버튼 표시 (메인 페이지가 아닐 때만 표시) */}
          {status === "unauthenticated" && pathname !== '/' && (
            <Link 
              href="/auth" 
              style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                marginRight: '15px'
              }}
              title="로그인"
            >
              로그인
            </Link>
          )}

          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleDarkMode}
            className="icon_button"
            title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}>
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
