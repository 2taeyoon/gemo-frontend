"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import LevelBar from "@/components/ui/LevelBar";

export default function page() {
  const { data: session, status } = useSession(); // 세션 정보
	const { user, loading, updateThema } = useUser(); // 사용자 정보 (MongoDB에서 가져온 데이터)


	/**
   * 로그아웃 처리 함수
   */
		const handleLogout = async () => {
			await signOut({ callbackUrl: '/' });
		};


  return (
    <div className="main_section">
      {/* <Link href="/auth" className="login_button_wrap">
        <div className="login_logo"></div>
        <p className="h3text">로그인 하러가기</p>
      </Link> */}


      {/* 로딩 상태 표시 */}
      {status === "loading" && ( <div style={{ color: 'var(--foreground)' }}>로딩 중...</div> )}

      {/* 로그인된 사용자 정보 및 레벨바 */}
      {status === "authenticated" && session?.user && (
        <div className="login_button_wrap authenticated">

					{/* 레벨바 로딩 중 */}
          {loading && (
						<div style={{color: 'var(--foreground)'}}>레벨 로딩 중...</div>
					)}

          {/* 사용자 정보 표시 */}
          <div style={{color: 'var(--foreground)'}}>{session.user.email || session.user.name}</div>

					{/* 레벨바 표시 */}
					{ user && !loading && ( 
							<div>
								<LevelBar showXpText={true} levleInfo={false} tooltip={false}/>
							</div>
						)}

					{/* 로그아웃 버튼 */}
          <button onClick={handleLogout} title="로그아웃" style={{color: 'var(--foreground)'}}>로그아웃</button>
        </div>
      )}

      {/* 로그인되지 않은 경우 로그인 버튼 표시 */}
      {status === "unauthenticated" && (
        <Link href="/auth" className="login_button_wrap not_authenticated">
          <div className="login_logo"></div>
          <p className="h3text">로그인 하러가기</p>
        </Link>
      )}
    </div>
  );
}
