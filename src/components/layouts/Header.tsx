"use client";

import React, { useEffect, useState } from "react";
import "@/styles/layouts/header.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import LevelBar from "@/components/ui/LevelBar";

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

  // 다크모드 상태는 user.thema 값을 기반으로 계산
  const darkMode = user?.thema === 'dark';

  /**
   * user.thema가 변경될 때마다 body 클래스를 업데이트합니다
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
   */
  const toggleDarkMode = () => {
    if (user) {
      const newThema = user.thema === 'light' ? 'dark' : 'light';
      updateThema(newThema);
    }
  };

  /**
   * 로그아웃 처리 함수
   */
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  // 경로별 헤더 설정 객체
  const pageConfig = {
    kodle: {
      text: "Kodle",
      link: "/kodle",
      logo: {
        light: "/favicons/kodle/favicon-192x192.png",
        dark: "/favicons/kodle/favicon-192x192-white.png"
      }
    },
    mypage: {
      text: "Gemo",
      link: "/",
      logo: {
        light: "/favicons/home/favicon-192x192.png",
        dark: "/favicons/home/favicon-192x192-white.png"
      }
    },
    default: {
      text: "Gemo",
      link: "/",
      logo: {
        light: "/favicons/home/favicon-192x192.png",
        dark: "/favicons/home/favicon-192x192-white.png"
      }
    }
  };

  /**
   * 현재 페이지 설정 가져오기 (경로 패턴 매칭)
   */
  const getCurrentConfig = () => {
    if (pathname.startsWith("/kodle")) {
      return pageConfig.kodle;
    }
    if (pathname.startsWith("/mypage")) {
      return pageConfig.mypage;
    }
    return pageConfig.default;
  };

  const currentConfig = getCurrentConfig();

	
  
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
        {/* 로고 및 제목 */}
        <Link href={currentConfig.link} className="header_logo_wrapper">
          <div className="header_logo">
            <Image src={darkMode ? currentConfig.logo.dark : currentConfig.logo.light}
              alt="gemo_logo" draggable={false} fill sizes="5rem"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <h4>{currentConfig.text}</h4>
        </Link>

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
          
          {/* 로그인된 사용자 정보 및 레벨바 */}
          {status === "authenticated" && session?.user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginRight: '15px'
            }}>
              {/* 레벨바 표시 */}
              {user && !loading && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <LevelBar size="small" showXpText={true} />
                </div>
              )}
              
              {/* 레벨바 로딩 중 */}
              {loading && (
                <span style={{ 
                  color: '#666',
                  fontSize: '12px'
                }}>
                  레벨 로딩 중...
                </span>
              )}
              
              {/* 사용자 이메일 표시 */}
              <span style={{ 
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {session.user.email || session.user.name}님
              </span>
              
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

          {/* 로그인되지 않은 경우 로그인 버튼 표시 */}
          {status === "unauthenticated" && (
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
