import React from 'react'
import Mypage from "@/app/mypage/Mypage";

export const metadata = {
	title: "MyPage",
	description: "내 정보 페이지입니다.",
};

/**
 * MyPage 서버 컴포넌트
 * 메타데이터 설정과 클라이언트 컴포넌트 렌더링
 */
export default function page() {
	return <Mypage />
}