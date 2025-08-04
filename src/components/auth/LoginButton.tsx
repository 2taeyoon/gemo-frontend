import React from 'react';

interface LoginButtonProps {
  provider: any;
  isLoading: boolean;
  onSignIn: (providerId: string) => void;
}

export default function LoginButton({ provider, isLoading, onSignIn }: LoginButtonProps) {
  return (
    <button
      onClick={() => onSignIn(provider.id)}
      disabled={isLoading}
      className={`login-button ${
        provider.id === "google" ? "login-button--google" : "login-button--default"
      } ${isLoading ? "login-button--loading" : ""}`}
    >
      {/* 구글 로그인 버튼에는 아이콘 추가 */}
      {provider.id === "google" && "🔗"}
      {isLoading ? "로그인 중..." : `${provider.name}으로 로그인`}
    </button>
  );
} 