'use client';

import { WordleTile } from './WordleTile';

interface WordleGridProps {
  guesses: string[];
  currentGuess: string;
  wordLength: number;
}

export function WordleGrid({ guesses, currentGuess, wordLength }: WordleGridProps) {
  const rows = Array(6).fill(null);
  const tiles = Array(wordLength).fill(null);

  return (
    <div className="grid grid-rows-6 gap-2">
      {rows.map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {tiles.map((_, tileIndex) => {
            const letter = rowIndex < guesses.length
              ? guesses[rowIndex][tileIndex]
              : rowIndex === guesses.length
                ? currentGuess[tileIndex]
                : '';
            
            return (
              <WordleTile
                key={tileIndex}
                letter={letter}
                isRevealed={rowIndex < guesses.length}
                isCorrect={rowIndex < guesses.length && letter === guesses[rowIndex][tileIndex]}
                isPresent={rowIndex < guesses.length && guesses[rowIndex].includes(letter)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
} 