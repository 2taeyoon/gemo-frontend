'use client';

interface WordleKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onEnter: () => void;
}

const KEYBOARD_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
];

export function WordleKeyboard({ onKeyPress, onDelete, onEnter }: WordleKeyboardProps) {
  return (
    <div className="flex flex-col gap-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {rowIndex === 2 && (
            <button
              onClick={onEnter}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Enter
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className="w-10 h-10 bg-gray-200 rounded hover:bg-gray-300"
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              ←
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 