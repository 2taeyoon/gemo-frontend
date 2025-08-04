// 코들 게임 관련 타입 정의

export interface WordData {
  easy: { word: string; definition: string }[];
  normal: { word: string; definition: string }[];
  hard: { word: string; definition: string }[];
}

export interface KodleGameState {
  targetWord: string;
  targetJamo: string[];
  currentRow: number;
  currentCol: number;
  gameOver: boolean;
  won: boolean;
  message: string;
  grid: string[][];
  cellStates: CellState[][];
  keyStates: KeyStates;
}

export type CellState = "correct" | "present" | "absent" | "";

export interface KeyStates {
  [key: string]: CellState;
}

export interface KeyboardMapping {
  [key: string]: string;
}

export interface KodleGameResult {
  won: boolean;
  attempts: number;
  targetWord: string;
  targetJamo: string[];
  timestamp: Date;
}

export interface KodleStats {
  totalWins: number;
  totalDefeats: number;
  consecutiveWins: number;
  maximumConsecutiveWins: number;
  winRate: number;
  averageAttempts: number;
}

export interface KodleSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  maxAttempts: number;
  showHints: boolean;
  keyboardLayout: 'qwerty' | 'dvorak';
}

export interface KodleHistory {
  id: string;
  result: KodleGameResult;
  stats: KodleStats;
  date: Date;
} 