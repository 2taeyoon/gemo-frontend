import Link from "next/link";

/**
 * 로그인 필요 컴포넌트
 */
export default function LoginRequired() {
  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="login-required">
          <h2>로그인이 필요합니다</h2>
          <p>마이페이지를 보려면 먼저 로그인해주세요.</p>
          <Link href="/auth" className="login-button">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
