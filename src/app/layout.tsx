import type React from "react"
import type { Metadata } from "next"

import "@/styles/style.css"
import "@/styles/common/common.css"

import { UserProvider } from "@/contexts/UserContext"
import ConditionalHeader from "@/components/layouts/ConditionalHeader"
import SessionWrapper from "@/components/SessionWrapper"


export const metadata: Metadata = {
  title: "GEMO",
  description: "Korean Word Game Platform",
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
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
            <ConditionalHeader />
            <main>
              {children}
            </main>
          </UserProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}