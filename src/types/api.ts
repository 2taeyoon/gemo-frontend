/**
 * API 관련 타입 정의
 */

// 기본 API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 에러 응답 타입
export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// 성공 응답 타입
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

// 사용자 프로필 API 응답
export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
  gameData: {
    level: number;
    currentXp: number;
    totalXp: number;
    kodleGameWins: number;
    kodleGameDefeat: number;
    kodleSuccessiveVictory: number;
    kodleMaximumSuccessiveVictory: number;
    gameWins: number;
    consecutiveWins: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 게임 승리 API 응답
export interface GameWinResponse {
  kodleGameWins: number;
  kodleGameDefeat: number;
  kodleSuccessiveVictory: number;
  kodleMaximumSuccessiveVictory: number;
  gameWins: number;
  consecutiveWins: number;
  level: number;
  currentXp: number;
  totalXp: number;
  xpEarned: number;
  levelUp?: boolean;
}

// 출석체크 API 응답
export interface AttendanceResponse {
  hasCheckedToday: boolean;
  lastAttendance: string | null;
  consecutiveAttendance: number;
  xpEarned?: number;
  newLevel?: number;
}

// API 엔드포인트 타입
export interface ApiEndpoints {
  // 사용자 관련
  getUserProfile: (userId: string) => string;
  updateUserProfile: (userId: string) => string;
  
  // 게임 관련
  kodleGameWin: (userId: string) => string;
  kodleGameDefeat: (userId: string) => string;
  gameWin: (userId: string) => string; // 하위 호환성
  resetWinStreak: (userId: string) => string;
  
  // 출석체크 관련
  attendance: () => string;
  checkAttendance: (userId: string) => string;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 요청 설정 타입
export interface ApiRequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
}

// API 클라이언트 옵션 타입
export interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  defaultHeaders?: Record<string, string>;
}

// 페이지네이션 타입
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// 페이지네이션된 응답 타입
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

// 검색 쿼리 타입
export interface SearchQuery {
  q?: string; // 검색어
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}
