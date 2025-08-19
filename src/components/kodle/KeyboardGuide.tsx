"use client";

/**
 * 키보드 가이드 컴포넌트
 * 영어 키보드와 한글 자모 매핑을 안내합니다.
 */
export default function KeyboardGuide() {
  return (
    <div className="keyboard-guide">
      <h3>⌨️ 키보드 가이드</h3>
      <div className="guide-content">
        <div className="guide-section">
          <h4>자음</h4>
          <div className="guide-mapping">
            <span>Q→ㅂ</span>
            <span>W→ㅈ</span>
            <span>E→ㄷ</span>
            <span>R→ㄱ</span>
            <span>T→ㅅ</span>
          </div>
          <div className="guide-mapping">
            <span>A→ㅁ</span>
            <span>S→ㄴ</span>
            <span>D→ㅇ</span>
            <span>F→ㄹ</span>
            <span>G→ㅎ</span>
          </div>
          <div className="guide-mapping">
            <span>Z→ㅋ</span>
            <span>X→ㅌ</span>
            <span>C→ㅊ</span>
            <span>V→ㅍ</span>
          </div>
        </div>
        
        <div className="guide-section">
          <h4>모음</h4>
          <div className="guide-mapping">
            <span>Y→ㅛ</span>
            <span>U→ㅕ</span>
            <span>I→ㅑ</span>
            <span>O→ㅐ</span>
            <span>P→ㅔ</span>
          </div>
          <div className="guide-mapping">
            <span>H→ㅗ</span>
            <span>J→ㅓ</span>
            <span>K→ㅏ</span>
            <span>L→ㅣ</span>
          </div>
          <div className="guide-mapping">
            <span>B→ㅠ</span>
            <span>N→ㅜ</span>
            <span>M→ㅡ</span>
          </div>
        </div>
      </div>
      
      <div className="guide-controls">
        <span><strong>Enter</strong>: 단어 제출</span>
        <span><strong>Backspace</strong>: 글자 삭제</span>
      </div>
    </div>
  );
}
