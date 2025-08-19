"use client";

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: { [key: string]: string };
  gameOver: boolean;
}

/**
 * 게임 키보드 컴포넌트
 * 한글 자모 입력을 위한 가상 키보드를 제공합니다.
 */
export default function GameKeyboard({ onKeyPress, usedLetters, gameOver }: GameKeyboardProps) {
  // 한글 자음 배치
  const consonants = [
    ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'],
    ['ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ'],
    ['ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  ];

  // 한글 모음 배치
  const vowels = [
    ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ'],
    ['ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'],
    ['ㅐ', 'ㅔ']
  ];

  const getKeyClass = (key: string): string => {
    let className = "keyboard-key";
    
    if (usedLetters[key]) {
      className += ` ${usedLetters[key]}`;
    }
    
    if (gameOver) {
      className += " disabled";
    }
    
    return className;
  };

  return (
    <div className="game-keyboard">
      {/* 자음 키보드 */}
      <div className="keyboard-section">
        <h3>자음</h3>
        {consonants.map((row, rowIndex) => (
          <div key={`consonant-${rowIndex}`} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={getKeyClass(key)}
                onClick={() => onKeyPress(key)}
                disabled={gameOver}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* 모음 키보드 */}
      <div className="keyboard-section">
        <h3>모음</h3>
        {vowels.map((row, rowIndex) => (
          <div key={`vowel-${rowIndex}`} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={getKeyClass(key)}
                onClick={() => onKeyPress(key)}
                disabled={gameOver}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* 컨트롤 키들 */}
      <div className="keyboard-controls">
        <button
          className="control-key backspace-key"
          onClick={() => onKeyPress('Backspace')}
          disabled={gameOver}
        >
          ⌫ 삭제
        </button>
        <button
          className="control-key enter-key"
          onClick={() => onKeyPress('Enter')}
          disabled={gameOver}
        >
          ↵ 확인
        </button>
      </div>
    </div>
  );
}
