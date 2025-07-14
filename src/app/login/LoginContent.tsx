"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import "../../styles/login.css";

/**
 * 로그인 페이지 메인 컴포넌트
 * Google OAuth를 통한 사용자 로그인 기능을 제공합니다.
 */
export default function LoginContent() {
  // 로그인 제공자 목록을 저장하는 상태
  const [providers, setProviders] = useState<any>(null);
  // 로그인 진행 상태를 관리하는 상태
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 컴포넌트 마운트 시 로그인 제공자 정보를 가져옵니다.
   */
  useEffect(() => {
    const getProvidersData = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    getProvidersData();
  }, []);

  /**
   * 로그인 제공자별 로그인 처리 함수
   * @param providerId - 로그인 제공자 ID (예: 'google')
   */
  const handleProviderSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      // 로그인 성공 시 홈페이지로 리디렉션
      await signIn(providerId, { callbackUrl: "/" });
    } catch (error) {
      console.error("로그인 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">로그인</h1>

        {/* 로그인 제공자가 있는 경우 로그인 버튼들을 표시 */}
        {providers && Object.values(providers).map((provider: any) => (
          <button
            key={provider.id}
            onClick={() => handleProviderSignIn(provider.id)}
            disabled={isLoading}
            className={`login-button ${
              provider.id === "google" ? "login-button--google" : "login-button--default"
            } ${isLoading ? "login-button--loading" : ""}`}
          >
            {/* 구글 로그인 버튼에는 아이콘 추가 */}
            {provider.id === "google" && "🔗"}
            {isLoading ? "로그인 중..." : `${provider.name}으로 로그인`}
          </button>
        ))}

        {/* 홈으로 돌아가기 링크 */}
        <div className="home-link-container">
          <Link href="/" className="home-link">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
