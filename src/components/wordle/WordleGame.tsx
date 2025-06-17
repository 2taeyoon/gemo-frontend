'use client';

import { useState, useEffect } from 'react';
import { WordleGrid } from './WordleGrid';
import { WordleKeyboard } from './WordleKeyboard';
import { WordleModal } from './WordleModal';
import { useWordleGame } from '@/hooks/wordle/useWordleGame';

export default function WordleGame() {
  const {
    currentWord,
    guesses,
    currentGuess,
    isGameOver,
    isWin,
    isLoading,
    error,
    handleKeyPress,
    handleDelete,
    handleEnter,
  } = useWordleGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleEnter();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (/^[가-힣]$/.test(e.key)) {
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleDelete, handleEnter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">단어를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <WordleGrid
        guesses={guesses}
        currentGuess={currentGuess}
        wordLength={currentWord.length}
      />
      <WordleKeyboard
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onEnter={handleEnter}
      />
      {(isGameOver || isWin) && (
        <WordleModal
          isWin={isWin}
          word={currentWord}
          onClose={() => window.location.reload()}
        />
      )}
    </div>
  );
} 