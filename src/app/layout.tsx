import type React from "react"
import type { Metadata } from "next"

import "@/styles/global.css"
import "@/styles/common.css"
import "@/styles/darkmode.css"
import "@/styles/fonts/pretendard.css"
import "@/styles/not-found.css"

import { UserProvider } from "@/contexts/UserContext"
import Header from "@/components/layouts/Header"
import SessionWrapper from "@/components/layouts/SessionWrapper"
import { headers } from "next/headers"


export const metadata: Metadata = {
  title: "Gemo",
  description: "Korean Word Game Platform",
  icons: {
    icon: [
      { url: "/favicons/home/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/home/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/home/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/home/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="color-scheme" content="dark light"/>
        <meta name="supported-color-schemes" content="dark"/>
      </head>
      <body>
        <SessionWrapper>
          <UserProvider>
            <Header />
            <main>
              {children}
            </main>
          </UserProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}