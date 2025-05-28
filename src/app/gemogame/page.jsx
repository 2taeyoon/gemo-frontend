import React from 'react'
import GemoGame from "@/app/gemogame/GemoGame";

export const metadata = {
  title: "GEMO",
  description: "시간 때울 때 사용하기 좋은 게임 GEMO입니다.",
	keywords: ["GEMO", "게임", "시간 때우기"],
  openGraph: {
    title: "GEMO",
    description: "시간 때울 때 사용하기 좋은 게임 GEMO입니다.",
    // url: "https://www.2taeyoon.com/",
    // images: [
    //   {
    //     url: "https://www.2taeyoon.com/favicon/main_meta_image.png",
    //     alt: "Profile Thumbnail",
    //   },
    // ],
    type: "website",
  },
};

export default function page() {
	return <GemoGame/>
}