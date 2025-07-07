"use client";

import React, { useEffect, useState } from "react";
import "@/styles/layouts/header.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false); // 다크모드 여부
  const pathname = usePathname() || ""; // 현재 경로 감지
  const { data: session, status } = useSession(); // NextAuth 세션 정보

  // 컴포넌트가 처음 렌더링될 때 다크모드 설정을 localStorage에서 불러옵니다
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // 다크모드가 변경될 때마다 localStorage에 저장하고 body 클래스를 업데이트합니다
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // 다크모드 토글 함수
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 로그아웃 처리 함수
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
    default: {
      text: "Gemo",
      link: "/",
      logo: {
        light: "/favicons/home/favicon-192x192.png",
        dark: "/favicons/home/favicon-192x192-white.png"
      }
    }
  };

  // 현재 페이지 설정 가져오기 (경로 패턴 매칭)
  const getCurrentConfig = () => {
    if (pathname.startsWith("/kodle")) {
      return pageConfig.kodle;
    }
    return pageConfig.default;
  };

  const currentConfig = getCurrentConfig();

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

        <div className="header_controls">
          {/* 사용자 정보 표시 */}
          {status === "loading" && (
            <span style={{ color: '#666' }}>로딩 중...</span>
          )}
          
          {status === "authenticated" && session?.user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              marginRight: '15px'
            }}>
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
              href="/login" 
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
            {/* {darkMode ? <Sun size={20} /> : <Moon size={20} />} */}
            {darkMode ? "🌞" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
