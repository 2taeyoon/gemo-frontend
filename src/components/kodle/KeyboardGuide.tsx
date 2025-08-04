import React from 'react';

export default function KeyboardGuide() {
  return (
    <div className="guide">
      <div className="guide_title">🎯 키보드 색상 가이드</div>
      <div className="guide_items">
        <div className="guide_item">
          <div className="guide_color guide_correct"></div>
          <span>정확한 위치 확정</span>
        </div>
        <div className="guide_item">
          <div className="guide_color guide_present"></div>
          <span>포함되지만 위치 미확정</span>
        </div>
        <div className="guide_item">
          <div className="guide_color guide_absent"></div>
          <span>포함되지 않음</span>
        </div>
        <div className="guide_item">
          <div className="guide_color guide_unused"></div>
          <span>미사용</span>
        </div>
      </div>
    </div>
  );
} 