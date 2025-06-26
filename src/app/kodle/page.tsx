import React from 'react'
import Kodle from "@/app/kodle/Kodle";

export const metadata = {
	title: "Kodle",
	description: "간단한 한국어 워들 게임인 'Kodle' 게임 페이지입니다.",
	icons: {
		icon: [
			{ url: "/favicons/kodle/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicons/kodle/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicons/kodle/favicon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		apple: { url: "/favicons/kodle/favicon-192x192.png", sizes: "192x192", type: "image/png" },
		shortcut: "/favicons/kodle/favicon.ico",
	},
	openGraph: {
		title: "Kodle - 한국어 워들 게임",
		description: "Kodle은 한국어 워들 게임입니다.",
		// url: "https://www.2taeyoon.com/kodle",
		// images: [
		// 	{
		// 		url: "https://www.2taeyoon.com/favicons/kodle/favicon-192x192.png",
		// 		alt: "Thumbnail",
		// 	},
		// ],
		type: "website",
	},
};

export default function page() {
	return <Kodle/>
}