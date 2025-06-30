import type React from "react"
import type { Metadata } from "next"

import "@/styles/global.css"
import "@/styles/darkmode.css"
import "@/styles/common.css"
import "@/styles/fonts/pretendard.css"
import "@/styles/components.css"

import { UserProvider } from "@/contexts/UserContext"
import Header from "@/layouts/Header"

export const metadata: Metadata = {
  title: "Gemo",
  description: "Gemo - 간단한 게임 및 테스트로 시간을 때우는 사이트입니다",
	icons: {
		icon: [
			{ url: "/favicons/home/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicons/home/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicons/home/favicon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		apple: { url: "/favicons/home/favicon-192x192.png", sizes: "192x192", type: "image/png" },
		shortcut: "/favicons/home/favicon.ico",
	},
	openGraph: {
		title: "Gemo",
		description: "Gemo - 간단한 게임 및 테스트로 시간을 때우는 사이트입니다",
		// url: "https://www.2taeyoon.com/kodle",
		// images: [
		// 	{
		// 		url: "https://www.2taeyoon.com/favicons/kodle/favicon-192x192.png",
		// 		alt: "Thumbnail",
		// 	},
		// ],
		type: "website",
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark"/>
        <meta name="supported-color-schemes" content="dark"/>
      </head>
      <body>
        <UserProvider>
          <Header />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}