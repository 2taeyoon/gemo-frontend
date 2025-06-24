import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { UserProvider } from "../contexts/UserContext"

// Google Fonts에서 Inter 폰트를 가져옵니다
const inter = Inter({ subsets: ["latin"] })

// 페이지의 메타데이터를 설정합니다 (브라우저 탭에 표시되는 정보)
export const metadata: Metadata = {
  title: "꼬들 - 한국어 워들 게임",
  description: "한국어로 즐기는 워들 게임",
}

// 모든 페이지에 공통으로 적용되는 레이아웃 컴포넌트입니다
export default function RootLayout({
  children, // 각 페이지의 내용이 여기에 들어갑니다
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* UserProvider로 전체 앱을 감싸서 사용자 정보를 전역에서 사용할 수 있게 합니다 */}
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
