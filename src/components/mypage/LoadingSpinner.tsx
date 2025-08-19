/**
 * 로딩 스피너 컴포넌트
 */
export default function LoadingSpinner() {
  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    </div>
  );
}
