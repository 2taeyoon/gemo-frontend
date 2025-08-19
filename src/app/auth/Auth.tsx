"use client";

import { getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import LoginButton from "@/components/auth/LoginButton";
import HomeLink from "@/components/auth/HomeLink";
import "@/styles/auth/auth.css";

/**
 * 로그인 페이지 메인 클라이언트 컴포넌트
 * Google, Naver OAuth를 통한 사용자 로그인 기능을 제공합니다.
 */
export default function Auth() {
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

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">로그인</h1>

        {/* 로그인 제공자가 있는 경우 로그인 버튼들을 표시 */}
        {providers && Object.values(providers).map((provider: any) => (
          <LoginButton
            key={provider.id}
            provider={provider}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />
        ))}

        {/* 홈으로 돌아가기 링크 */}
        <HomeLink />
      </div>
    </div>
  );
}
