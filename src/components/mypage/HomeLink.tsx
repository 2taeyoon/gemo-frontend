import Link from "next/link";

/**
 * 홈으로 돌아가기 링크 컴포넌트
 */
export default function HomeLink() {
  return (
    <div className="mypage-footer">
      <Link href="/" className="home-link">
        🏠 홈으로 돌아가기
      </Link>
    </div>
  );
}
