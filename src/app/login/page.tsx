"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// 로딩 컴포넌트
function LoadingSpinner() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-color, #f5f5f5)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--card-bg, white)",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #0070f3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <p style={{ color: "var(--text-color, #666)" }}>로딩 중...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    </div>
  );
}

// Dynamic import로 로그인 컴포넌트 불러오기 (SSR 비활성화)
const DynamicLoginContent = dynamic(() => import("./LoginContent"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

// 메인 페이지 컴포넌트
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DynamicLoginContent />
    </Suspense>
  );
}