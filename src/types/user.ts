// 사용자 관련 타입 정의

export interface User {
  id: string;
  name: string;
  email: string;
  thema: 'light' | 'dark';
  superAdmin: boolean;
  level: number;
  currentXp: number;
  totalXp: number;
  lastAttendance: string | null;
  consecutiveAttendance: number;
  kodleGameWins: number;
  kodleGameDefeat: number;
  kodleSuccessiveVictory: number;
  kodleMaximumSuccessiveVictory: number;
  gameWins: number;
  consecutiveWins: number;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  levelUpInfo: LevelUpInfo | null;
  fetchUserProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
  addXp: (amount: number, reason: string) => Promise<void>;
  checkAttendance: () => Promise<void>;
  addKodleGameWin: () => Promise<void>;
  addKodleGameDefeat: () => Promise<void>;
  clearLevelUp: () => void;
}

export interface LevelUpInfo {
  isLevelUp: boolean;
  newLevel: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  thema?: string;
  superAdmin?: boolean;
  gameData?: {
    level?: number;
    currentXp?: number;
    totalXp?: number;
    lastAttendance?: string;
    consecutiveAttendance?: number;
    kodleGameWins?: number;
    kodleGameDefeat?: number;
    kodleSuccessiveVictory?: number;
    kodleMaximumSuccessiveVictory?: number;
    gameWins?: number;
    consecutiveWins?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceStatus {
  hasCheckedToday: boolean;
  lastAttendance: string | null;
  consecutiveAttendance: number;
}

export interface AttendanceResponse {
  consecutiveAttendance: number;
  xpGained: number;
  baseXp: number;
  bonusXp: number;
  level: number;
  currentXp: number;
  totalXp: number;
  leveledUp: boolean;
} 