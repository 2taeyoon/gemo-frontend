'use client';

interface WordleTileProps {
  letter: string;
  isRevealed: boolean;
  isCorrect: boolean;
  isPresent: boolean;
}

export function WordleTile({ letter, isRevealed, isCorrect, isPresent }: WordleTileProps) {
  const getBackgroundColor = () => {
    if (!isRevealed) return 'bg-white';
    if (isCorrect) return 'bg-green-500';
    if (isPresent) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div
      className={`w-14 h-14 border-2 border-gray-300 flex items-center justify-center text-2xl font-bold ${getBackgroundColor()}`}
    >
      {letter}
    </div>
  );
} 