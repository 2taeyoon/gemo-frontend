"use client";

import React, { useEffect, useState } from "react";
import "@/styles/layouts/header.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false); // 다크모드 여부
  const pathname = usePathname(); // 현재 경로 감지

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
				{/* <Link href={currentConfig.link} className={styles.headerLogo}>
					<Image 
						src={darkMode ? currentConfig.logo.dark : currentConfig.logo.light} 
						alt="gemo_logo"
						style={{ width: '5rem', height: '5rem' }}
					/>
					</Link> */}
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
          {/* {user && (
						<>
							<span className={styles.userGreeting}>
								{user.name}님 반갑습니다!
							</span>
							<LevelBar size="small" />
							<Link href="/attendance" className={styles.iconButton} title="출석체크">
						<Calendar size={20} />
					</Link>
						</>
					)} */}

          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleDarkMode}
            className="icon_button"
            title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}>
            {/* {darkMode ? <Sun size={20} /> : <Moon size={20} />} */}
          </button>

          {/* 기타 버튼들 */}
          {/* <Link href="/login" className={styles.iconButton} title="로그인">
				<User size={20} />
			</Link>
			<Settings size={24} className={styles.icon} />
			<HelpCircle size={24} className={styles.icon} />
			<BarChart3 size={24} className={styles.icon} /> */}
        </div>
      </div>
    </header>
  );
}
