// 게임 통계 관련 유틸리티 함수들

import { User } from '@/types/user';

/**
 * 게임 승률 계산
 * @param wins - 승리 횟수
 * @param defeats - 패배 횟수
 * @returns 승률 (소수점 1자리까지)
 */
export const calculateWinRate = (wins: number, defeats: number): string => {
  const totalGames = wins + defeats;
  if (totalGames === 0) return '0.0';
  return ((wins / totalGames) * 100).toFixed(1);
};

/**
 * 사용자의 게임 통계 정보 계산
 * @param user - 사용자 정보
 * @returns 게임 통계 객체
 */
export const calculateGameStats = (user: User) => {
  const wins = user.kodleGameWins || user.gameWins || 0;
  const defeats = user.kodleGameDefeat || 0;
  const consecutiveWins = user.kodleSuccessiveVictory || user.consecutiveWins || 0;
  const maxConsecutiveWins = user.kodleMaximumSuccessiveVictory || 0;
  const totalGames = wins + defeats;
  const winRate = calculateWinRate(wins, defeats);

  return {
    wins,
    defeats,
    consecutiveWins,
    maxConsecutiveWins,
    totalGames,
    winRate
  };
};

/**
 * 레벨 진행률 계산
 * @param currentXp - 현재 경험치
 * @param totalXp - 총 경험치
 * @param level - 현재 레벨
 * @returns 레벨 진행률 정보
 */
export const calculateLevelProgress = (currentXp: number, totalXp: number, level: number) => {
  // 다음 레벨까지 필요한 경험치 계산 (간단한 공식)
  const xpToNextLevel = level * 100; // 예시: 레벨 * 100
  const progressPercentage = Math.min((currentXp / xpToNextLevel) * 100, 100);

  return {
    currentLevel: level,
    currentXp,
    totalXp,
    xpToNextLevel,
    progressPercentage: Math.round(progressPercentage)
  };
};

/**
 * 게임 성과 등급 계산
 * @param winRate - 승률
 * @returns 등급 문자열
 */
export const calculateGrade = (winRate: string): string => {
  const rate = parseFloat(winRate);
  
  if (rate >= 90) return 'S';
  if (rate >= 80) return 'A';
  if (rate >= 70) return 'B';
  if (rate >= 60) return 'C';
  if (rate >= 50) return 'D';
  return 'F';
};

/**
 * 연속 승리 보너스 계산
 * @param consecutiveWins - 연속 승리 횟수
 * @returns 보너스 경험치
 */
export const calculateConsecutiveWinBonus = (consecutiveWins: number): number => {
  if (consecutiveWins >= 10) return 200;
  if (consecutiveWins >= 7) return 150;
  if (consecutiveWins >= 5) return 100;
  if (consecutiveWins >= 3) return 50;
  return 0;
};

/**
 * 게임 통계 요약 정보 생성
 * @param user - 사용자 정보
 * @returns 통계 요약 문자열
 */
export const generateStatsSummary = (user: User): string => {
  const stats = calculateGameStats(user);
  const grade = calculateGrade(stats.winRate);
  
  return `${stats.totalGames}게임 ${stats.wins}승 ${stats.defeats}패 (승률: ${stats.winRate}%, 등급: ${grade})`;
}; 