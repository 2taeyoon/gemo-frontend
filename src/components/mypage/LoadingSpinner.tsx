import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "로딩 중..." }: LoadingSpinnerProps) {
  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
} 