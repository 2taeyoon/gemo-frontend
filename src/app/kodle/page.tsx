import React from 'react'
import Kodle from "@/app/kodle/Kodle";

export const metadata = {
	title: "Kodle - 한국어 워들 게임",
	description: "Kodle 게임 페이지입니다. 한국어 워들 게임입니다.",
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