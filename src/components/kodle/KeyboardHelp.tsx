import React from 'react';

export default function KeyboardHelp() {
  return (
    <div className="keyboard_help">
      <div className="guide_title">⌨️ 키보드 입력 가능!</div>
      <div className="help_content">
        <div>
          <strong>자음:</strong> Q(ㅂ) W(ㅈ) E(ㄷ) R(ㄱ) T(ㅅ) A(ㅁ) S(ㄴ)
          D(ㅇ) F(ㄹ) G(ㅎ) Z(ㅋ) X(ㅌ) C(ㅊ) V(ㅍ)
        </div>
        <div>
          <strong>모음:</strong> Y(ㅛ) U(ㅕ) I(ㅑ) O(ㅐ) P(ㅔ) H(ㅗ) J(ㅓ)
          K(ㅏ) L(ㅣ) B(ㅠ) N(ㅜ) M(ㅡ)
        </div>
        <div>
          <strong>복합 입력:</strong> ㅢ = ㅡ+ㅣ, ㄲ = ㄱ+ㄱ, ㅝ = ㅜ+ㅓ 등
        </div>
        <div>
          <strong>조작:</strong> Enter(입력) Backspace(삭제)
        </div>
      </div>
    </div>
  );
} 