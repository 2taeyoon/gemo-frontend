/**
 * 게임 관련 타입 정의
 */

// 코들 게임 관련 타입들
export interface KodleGame {
  id: string;
  targetWord: string;
  targetJamo: string[];
  currentRow: number;
  currentCol: number;
  gameOver: boolean;
  won: boolean;
  attempts: number;
  maxAttempts: number;
  startTime: Date;
  endTime?: Date;
}

// 게임 그리드 타입
export type GameGrid = string[][];

// 셀 상태 타입
export type CellState = "correct" | "present" | "absent" | "";
export type CellStates = CellState[][];

// 키보드 상태 타입
export type KeyState = "correct" | "present" | "absent" | "";
export interface KeyStates {
  [key: string]: KeyState;
}

// 게임 결과 타입
export interface GameResult {
  won: boolean;
  attempts: number;
  targetWord: string;
  guesses: string[];
  timeElapsed: number; // 초 단위
  xpEarned: number;
  newLevel?: number; // 레벨업한 경우
}

// 단어 데이터 타입
export interface WordEntry {
  word: string;
  definition: string;
  difficulty?: 'easy' | 'normal' | 'hard';
}

export interface WordData {
  easy: WordEntry[];
  normal?: WordEntry[];
  hard?: WordEntry[];
}

// 게임 통계 타입
export interface GameStats {
  totalGames: number;
  wins: number;
  defeats: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  averageAttempts: number;
  fastestTime?: number; // 가장 빠른 클리어 시간 (초)
}

// 게임 설정 타입
export interface GameSettings {
  maxAttempts: number;
  timeLimit?: number; // 제한 시간 (초), 없으면 무제한
  difficulty: 'easy' | 'normal' | 'hard';
  hints: boolean; // 힌트 사용 여부
  keyboard: 'virtual' | 'physical' | 'both'; // 키보드 타입
}

// 경험치 계산 관련 타입
export interface XpCalculation {
  baseXp: number;
  streakBonus: number;
  speedBonus?: number;
  difficultyBonus?: number;
  totalXp: number;
}

// 게임 이벤트 타입
export type GameEvent = 
  | { type: 'GAME_START'; payload: { targetWord: string } }
  | { type: 'KEY_PRESS'; payload: { key: string } }
  | { type: 'GUESS_SUBMIT'; payload: { guess: string[]; result: CellState[] } }
  | { type: 'GAME_WIN'; payload: { attempts: number; timeElapsed: number } }
  | { type: 'GAME_LOSE'; payload: { attempts: number } }
  | { type: 'GAME_RESET' };

// 게임 상태 타입
export interface GameState {
  status: 'idle' | 'playing' | 'won' | 'lost';
  grid: GameGrid;
  cellStates: CellStates;
  keyStates: KeyStates;
  currentRow: number;
  currentCol: number;
  targetWord: string;
  targetJamo: string[];
  message: string;
  xpEarned?: number;
}
