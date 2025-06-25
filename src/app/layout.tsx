import type React from "react"
import type { Metadata } from "next"

import "@/styles/init.css"
import "@/styles/darkmode.css"
import "@/styles/fonts/pretendard.css"

import { UserProvider } from "@/contexts/UserContext"

export const metadata: Metadata = {
  title: "Gemo",
  description: "Gemo - 간단한 게임 사이트입니다",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark"/>
        <meta name="supported-color-schemes" content="dark"/>
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/home/favicon-192x192.png"/>
        <link rel="icon" type="image/png" sizes="96x96" href="/favicons/home/favicon-96x96.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/home/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/home/favicon-16x16.png"/>
        <link rel="shortcut icon" type="image/x-icon" href="/favicons/home/favicon.ico"/>
        <link rel="icon" href="/favicons/home/favicon.ico" title="icon"/>
      </head>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}