/**
 * 사용자 관련 타입 정의
 */

// 사용자 기본 정보 타입
export interface User {
  id: string; // 사용자 고유 ID
  name: string; // 사용자 이름
  email: string; // 이메일 주소
  picture?: string; // 프로필 사진 URL
  googleId?: string; // Google OAuth ID
  naverId?: string; // Naver OAuth ID (새로 추가)
  thema: 'light' | 'dark'; // 다크모드 설정
  active: boolean; // 활성 사용자 여부
  superAdmin: boolean; // 슈퍼 관리자 권한 여부
  createdAt: string; // 계정 생성일
  updatedAt: string; // 마지막 업데이트일
  
  // 게임 데이터
  level: number; // 현재 레벨
  currentXp: number; // 현재 레벨에서의 경험치
  totalXp: number; // 총 누적 경험치
  lastAttendance: string | null; // 마지막 출석 날짜 (YYYY-MM-DD 형식)
  consecutiveAttendance: number; // 연속 출석 일수
  
  // 코들 게임 관련 통계 (새로운 구조)
  kodleGameWins: number; // 코들 게임 승리 횟수
  kodleGameDefeat: number; // 코들 게임 패배 횟수
  kodleSuccessiveVictory: number; // 코들 게임 연속 승리 횟수
  kodleMaximumSuccessiveVictory: number; // 코들 게임 최대 연속 승리 기록
  
  // 하위 호환성을 위한 필드들 (기존 코드에서 사용 중)
  gameWins: number; // kodleGameWins와 동일한 값
  consecutiveWins: number; // kodleSuccessiveVictory와 동일한 값
}

// 사용자 프로필 업데이트 타입
export interface UserProfileUpdate {
  name?: string;
  picture?: string;
  thema?: 'light' | 'dark';
}

// 사용자 통계 타입
export interface UserStats {
  level: number;
  currentXp: number;
  totalXp: number;
  kodleGameWins: number;
  kodleGameDefeat: number;
  kodleSuccessiveVictory: number;
  kodleMaximumSuccessiveVictory: number;
  winRate: number; // 승률 (계산된 값)
}

// 출석체크 상태 타입
export interface AttendanceStatus {
  hasCheckedToday: boolean;
  lastAttendance: string | null;
  consecutiveAttendance: number;
}

// 출석 업적 키 타입
export type AttendanceAchievementKey = 'd1' | 'd7' | 'd14' | 'd21' | 'd28';

// 출석 업적 아이템 타입
export interface AttendanceAchievementItem {
  completed: boolean;
  text: string;
}

// 게임 데이터 업적 타입
export interface GameDataAchievements {
  attendance: Record<AttendanceAchievementKey, AttendanceAchievementItem>;
}

// 게임 데이터 타입 (기존 사용자 타입에서 분리)
export interface GameData {
  level: number;
  currentXp: number;
  totalXp: number;
  lastAttendance: string | null;
  consecutiveAttendance: number;
  kodleGameWins: number;
  kodleGameDefeat: number;
  kodleSuccessiveVictory: number;
  kodleMaximumSuccessiveVictory: number;
  totalScore: number;
  kodleTotalPlayed: number;
  achievements: GameDataAchievements;
  lastPlayed: string | null;
}

// 레벨 정보 타입
export interface LevelInfo {
  level: number;
  currentXp: number;
  requiredXp: number;
  progressPercentage: number;
}
