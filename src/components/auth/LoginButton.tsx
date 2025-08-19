"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface LoginButtonProps {
  provider: {
    id: string;
    name: string;
  };
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

/**
 * 로그인 제공자별 로그인 버튼 컴포넌트
 */
export default function LoginButton({ provider, isLoading, onLoadingChange }: LoginButtonProps) {
  /**
   * 로그인 제공자별 로그인 처리 함수
   * @param providerId - 로그인 제공자 ID (예: 'google', 'naver')
   */
  const handleProviderSignIn = async (providerId: string) => {
    onLoadingChange(true);
    try {
      // 로그인 성공 시 홈페이지로 리디렉션
      await signIn(providerId, { callbackUrl: "/" });
    } catch (error) {
      console.error("로그인 에러:", error);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <button
      onClick={() => handleProviderSignIn(provider.id)}
      disabled={isLoading}
      className={`login-button ${
        provider.id === "google" ? "login-button--google" : 
        provider.id === "naver" ? "login-button--naver" : 
        "login-button--default"
      } ${isLoading ? "login-button--loading" : ""}`}
    >
      {/* 로그인 제공자별 아이콘 */}
      {provider.id === "google" && "🔗"}
      {provider.id === "naver" && "🟢"}
      {isLoading ? "로그인 중..." : `${provider.name}으로 로그인`}
    </button>
  );
}
