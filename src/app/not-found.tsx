import Link from "next/link";
import "@/styles/not-found.css";

/**
 * 404 Not Found 페이지
 * 존재하지 않는 경로에 접근했을 때 표시됩니다.
 * 헤더 컴포넌트가 표시되지 않는 독립적인 페이지입니다.
 */
export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <span className="not-found-emoji">🔍</span>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">페이지를 찾을 수 없습니다</h2>
        <p className="not-found-description">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          <br />
          아래 버튼을 통해 다른 페이지로 이동해보세요.
        </p>
        
        <div className="not-found-actions">
          <Link href="/" className="not-found-button not-found-button--primary">
            🏠 홈으로 돌아가기
          </Link>
          <Link href="/kodle" className="not-found-button">
            🎮 Kodle 게임하기
          </Link>
          <Link href="/auth" className="not-found-button">
            🔐 로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
