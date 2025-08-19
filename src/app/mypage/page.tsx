import React from 'react'
import MyPage from "./MyPage";

export const metadata = {
	title: "MyPage",
	description: "내 정보 페이지입니다.",
};

/**
 * MyPage 서버 컴포넌트
 * 메타데이터 설정과 클라이언트 컴포넌트 렌더링
 */
export default function page() {
	return <MyPage />
}