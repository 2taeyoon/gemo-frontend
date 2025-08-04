// API 응답 관련 타입 정의

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfileResponse extends ApiResponse {
  data?: {
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
  };
}

export interface AttendanceResponse extends ApiResponse {
  data?: {
    consecutiveAttendance: number;
    xpGained: number;
    baseXp: number;
    bonusXp: number;
    level: number;
    currentXp: number;
    totalXp: number;
    leveledUp: boolean;
  };
}

export interface GameWinResponse extends ApiResponse {
  data?: {
    gameWins: number;
    consecutiveWins: number;
    kodleGameWins: number;
    kodleSuccessiveVictory: number;
    kodleMaximumSuccessiveVictory: number;
    level: number;
    currentXp: number;
    totalXp: number;
  };
}

export interface GameDefeatResponse extends ApiResponse {
  data?: {
    kodleGameDefeat: number;
    kodleGameWins: number;
    kodleSuccessiveVictory: number;
    kodleMaximumSuccessiveVictory: number;
    level: number;
    currentXp: number;
    totalXp: number;
  };
}

export interface XpResponse extends ApiResponse {
  data?: {
    level: number;
    currentXp: number;
    totalXp: number;
    leveledUp: boolean;
  };
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
} 