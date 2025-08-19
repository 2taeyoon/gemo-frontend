/**
 * Kodle 게임 전용 타입 정의
 */

// Kodle 게임 상태
export interface KodleGameState {
  // 게임 기본 정보
  targetWord: string;
  targetJamo: string[];
  currentRow: number;
  currentCol: number;
  gameOver: boolean;
  won: boolean;
  message: string;
  
  // 그리드와 상태
  grid: string[][];
  result: string[][];
  usedLetters: { [key: string]: string };
  
  // 게임 설정
  maxRows: number;
  maxCols: number;
  
  // 통계
  attempts: number;
  startTime: Date;
  endTime?: Date;
}

// Kodle 게임 props 타입
export interface KodleGameProps {
  difficulty?: 'easy' | 'normal' | 'hard';
  wordList?: string[];
  onGameEnd?: (result: KodleGameResult) => void;
}

// Kodle 게임 결과
export interface KodleGameResult {
  won: boolean;
  targetWord: string;
  attempts: number;
  timeElapsed: number;
  guesses: string[];
}

// Kodle 키보드 매핑
export interface KodleKeyMapping {
  [englishKey: string]: string; // 한글 자모
}

// Kodle 단어 유효성 검사 결과
export interface KodleWordValidation {
  isValid: boolean;
  reason?: 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_CHARACTERS' | 'NOT_IN_DICTIONARY';
  message?: string;
}

// Kodle 힌트 타입
export interface KodleHint {
  type: 'LETTER_COUNT' | 'FIRST_LETTER' | 'CATEGORY' | 'DEFINITION';
  content: string;
  used: boolean;
  cost?: number; // XP 비용
}

// Kodle 게임 설정
export interface KodleSettings {
  showKeyboard: boolean;
  showHints: boolean;
  autoSubmit: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

// Kodle 통계
export interface KodleStats {
  totalGames: number;
  wins: number;
  defeats: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  averageAttempts: number;
  bestTime: number; // 초 단위
  
  // 시도 횟수별 승리 분포
  attemptDistribution: {
    [attempts: number]: number;
  };
  
  // 일별 게임 수
  dailyGames: {
    [date: string]: number;
  };
}

// Kodle 게임 이벤트
export type KodleGameEvent = 
  | { type: 'INIT_GAME'; targetWord: string }
  | { type: 'INPUT_LETTER'; letter: string }
  | { type: 'DELETE_LETTER' }
  | { type: 'SUBMIT_GUESS'; guess: string[] }
  | { type: 'WIN_GAME'; attempts: number }
  | { type: 'LOSE_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'USE_HINT'; hint: KodleHint };

// Kodle 액션 결과
export interface KodleActionResult {
  success: boolean;
  newState?: Partial<KodleGameState>;
  message?: string;
  error?: string;
}
