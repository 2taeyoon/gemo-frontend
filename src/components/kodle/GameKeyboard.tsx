import React from 'react';
import { keyboardRows, getKeyClass } from '@/utils/kodleGame';

interface GameKeyboardProps {
  keyStates: { [key: string]: "correct" | "present" | "absent" | "" };
  gameOver: boolean;
  onKeyPress: (key: string) => void;
}

export default function GameKeyboard({ keyStates, gameOver, onKeyPress }: GameKeyboardProps) {
  return (
    <div className="keyboard">
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard_row">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              disabled={gameOver}
              className={
                key === "입력" || key === "삭제"
                  ? `key key_special`
                  : getKeyClass(key, keyStates)
              }>
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
} 