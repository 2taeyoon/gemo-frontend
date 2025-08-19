/**
 * 에러 메시지 컴포넌트
 */
export default function ErrorMessage() {
  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="error-message">
          <h2>오류가 발생했습니다</h2>
          <p>사용자 정보를 불러올 수 없습니다.</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
