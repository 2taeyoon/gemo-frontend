'use client';

interface WordleModalProps {
  isWin: boolean;
  word: string;
  onClose: () => void;
}

export function WordleModal({ isWin, word, onClose }: WordleModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isWin ? '축하합니다!' : '아쉽네요!'}
        </h2>
        <p className="mb-4">
          {isWin
            ? '단어를 맞추셨습니다!'
            : `정답은 "${word}" 였습니다.`}
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시작
        </button>
      </div>
    </div>
  );
} 