"use client";

import { useState } from "react";

/**
 * 키보드 도움말 컴포넌트
 * 토글 가능한 키보드 가이드를 제공합니다.
 */
export default function KeyboardHelp() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="keyboard-help">
      <button 
        className="help-toggle"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? '📖 도움말 숨기기' : '❓ 키보드 도움말'}
      </button>
      
      {isVisible && (
        <div className="help-content">
          <div className="help-section">
            <h4>🎯 게임 방법</h4>
            <ul>
              <li>6번의 기회로 정답을 맞춰보세요</li>
              <li>각 시도마다 색깔로 힌트를 제공합니다</li>
              <li><span className="demo-correct">녹색</span>: 정확한 위치의 정확한 글자</li>
              <li><span className="demo-present">노란색</span>: 단어에 있지만 위치가 틀린 글자</li>
              <li><span className="demo-absent">회색</span>: 단어에 없는 글자</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>⌨️ 키보드 단축키</h4>
            <div className="shortcut-grid">
              <div className="shortcut-item">
                <span className="key">Enter</span>
                <span className="desc">단어 제출</span>
              </div>
              <div className="shortcut-item">
                <span className="key">Backspace</span>
                <span className="desc">글자 삭제</span>
              </div>
              <div className="shortcut-item">
                <span className="key">A-Z</span>
                <span className="desc">한글 자모 입력</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
