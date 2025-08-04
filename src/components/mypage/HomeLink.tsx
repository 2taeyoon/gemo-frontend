import React from 'react';
import Link from 'next/link';

export default function HomeLink() {
  return (
    <div className="mypage-footer">
      <Link href="/" className="home-link">
        🏠 홈으로 돌아가기
      </Link>
    </div>
  );
} 