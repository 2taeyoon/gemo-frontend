import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  title = "오류가 발생했습니다",
  message = "사용자 정보를 불러올 수 없습니다.",
  buttonText = "다시 시도",
  onRetry = () => window.location.reload()
}: ErrorMessageProps) {
  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="error-message">
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onRetry} className="retry-button">
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
} 