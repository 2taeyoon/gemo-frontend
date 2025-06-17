import { useState, useCallback, useEffect } from 'react';
import { wordApi } from '@/services/api';

export function useWordleGame() {
  const [currentWord, setCurrentWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        const word = await wordApi.getRandomWord();
        setCurrentWord(word.word);
        setError(null);
      } catch (err) {
        setError('단어를 불러오는데 실패했습니다.');
        console.error('Error fetching word:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (isGameOver || currentGuess.length >= currentWord.length) return;
    setCurrentGuess(prev => prev + key);
  }, [currentGuess.length, currentWord.length, isGameOver]);

  const handleDelete = useCallback(() => {
    if (isGameOver) return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [isGameOver]);

  const handleEnter = useCallback(() => {
    if (isGameOver || currentGuess.length !== currentWord.length) return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === currentWord) {
      setIsWin(true);
      setIsGameOver(true);
    } else if (newGuesses.length >= 6) {
      setIsGameOver(true);
    }
  }, [currentGuess, currentWord, guesses, isGameOver]);

  return {
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
  };
} 