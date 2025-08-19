import React from 'react'
import MyPage from "@/app/mypage/Mypage";

export const metadata = {
	title: "MyPage",
	description: "내 정보 페이지입니다.",
};

export default function page() {
	return <MyPage/>
}