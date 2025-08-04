// 게임 관련 타입 정의

export interface GameStats {
  totalWins: number;
  totalDefeats: number;
  consecutiveWins: number;
  maximumConsecutiveWins: number;
  winRate: number;
  totalGames: number;
}

export interface GameResult {
  won: boolean;
  attempts: number;
  maxAttempts: number;
  targetWord: string;
  timestamp: Date;
}

export interface GameSettings {
  maxAttempts: number;
  difficulty: 'easy' | 'normal' | 'hard';
  theme: 'light' | 'dark';
}

export interface GameHistory {
  id: string;
  gameType: 'kodle' | 'wordle' | 'other';
  result: GameResult;
  stats: GameStats;
  date: Date;
}

export interface LevelProgress {
  currentLevel: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

export interface RewardInfo {
  type: 'attendance' | 'game_win' | 'level_up' | 'achievement';
  amount: number;
  reason: string;
  timestamp: Date;
} 