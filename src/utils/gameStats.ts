/**
 * 게임 통계 관련 유틸리티 함수들
 */

import type { User, GameStats } from '@/types';

/**
 * 승률 계산 함수
 * @param wins - 승리 횟수
 * @param defeats - 패배 횟수
 * @returns 승률 (백분율, 소수점 1자리)
 */
export function calculateWinRate(wins: number, defeats: number): number {
  const totalGames = wins + defeats;
  if (totalGames === 0) return 0;
  
  return Number(((wins / totalGames) * 100).toFixed(1));
}

/**
 * 사용자의 코들 게임 통계 계산
 * @param user - 사용자 정보
 * @returns 게임 통계 객체
 */
export function calculateKodleStats(user: User): GameStats {
  const wins = user.kodleGameWins || user.gameWins || 0;
  const defeats = user.kodleGameDefeat || 0;
  const totalGames = wins + defeats;
  const winRate = calculateWinRate(wins, defeats);
  
  return {
    totalGames,
    wins,
    defeats,
    winRate,
    currentStreak: user.kodleSuccessiveVictory || user.consecutiveWins || 0,
    maxStreak: user.kodleMaximumSuccessiveVictory || 0,
    averageAttempts: 0, // 이 정보는 별도로 추적 필요
  };
}

/**
 * 게임 레벨에 따른 난이도 정보
 * @param level - 사용자 레벨
 * @returns 난이도 정보
 */
export function getDifficultyByLevel(level: number): {
  difficulty: 'easy' | 'normal' | 'hard';
  name: string;
  description: string;
} {
  if (level < 10) {
    return {
      difficulty: 'easy',
      name: '초보자',
      description: '2-3글자 단어'
    };
  } else if (level < 25) {
    return {
      difficulty: 'normal',
      name: '중급자',
      description: '3-4글자 단어'
    };
  } else {
    return {
      difficulty: 'hard',
      name: '고급자',
      description: '4-5글자 단어'
    };
  }
}

/**
 * 통계 카드 데이터 생성
 * @param user - 사용자 정보
 * @param attendanceStreak - 연속 출석 일수
 * @returns 통계 카드 배열
 */
export function getStatsCardData(user: User, attendanceStreak: number) {
  const stats = calculateKodleStats(user);
  
  return [
    {
      id: 'attendance',
      label: '연속 출석',
      value: attendanceStreak,
      icon: '📅',
      color: '#4caf50'
    },
    {
      id: 'wins',
      label: '코들 게임 승리',
      value: stats.wins,
      icon: '🏆',
      color: '#ff9800'
    },
    {
      id: 'defeats',
      label: '코들 게임 패배',
      value: stats.defeats,
      icon: '😞',
      color: '#f44336'
    },
    {
      id: 'currentStreak',
      label: '코들 게임 연속 승리',
      value: stats.currentStreak,
      icon: '🔥',
      color: '#e91e63'
    },
    {
      id: 'maxStreak',
      label: '코들 게임 최대 연속 승리',
      value: stats.maxStreak,
      icon: '⭐',
      color: '#9c27b0'
    },
    {
      id: 'winRate',
      label: '코들 게임 승률',
      value: `${stats.winRate}%`,
      icon: '📊',
      color: '#2196f3'
    }
  ];
}

/**
 * 진행률 계산 (다음 목표까지)
 * @param current - 현재 값
 * @param target - 목표 값
 * @returns 진행률 (0-100)
 */
export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 100;
  return Math.min((current / target) * 100, 100);
}

/**
 * 게임 성과 배지 계산
 * @param stats - 게임 통계
 * @returns 획득한 배지 배열
 */
export function calculateAchievementBadges(stats: GameStats): Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}> {
  const badges = [
    {
      id: 'first_win',
      name: '첫 승리',
      description: '첫 번째 게임 승리',
      icon: '🎯',
      earned: stats.wins >= 1
    },
    {
      id: 'winning_streak_3',
      name: '연승 달인',
      description: '3연승 달성',
      icon: '🔥',
      earned: stats.maxStreak >= 3
    },
    {
      id: 'winning_streak_5',
      name: '연승 마스터',
      description: '5연승 달성',
      icon: '⚡',
      earned: stats.maxStreak >= 5
    },
    {
      id: 'winning_streak_10',
      name: '연승 전설',
      description: '10연승 달성',
      icon: '👑',
      earned: stats.maxStreak >= 10
    },
    {
      id: 'games_10',
      name: '게임 애호가',
      description: '10게임 플레이',
      icon: '🎮',
      earned: stats.totalGames >= 10
    },
    {
      id: 'games_50',
      name: '게임 마니아',
      description: '50게임 플레이',
      icon: '🎯',
      earned: stats.totalGames >= 50
    },
    {
      id: 'games_100',
      name: '게임 중독자',
      description: '100게임 플레이',
      icon: '🏆',
      earned: stats.totalGames >= 100
    },
    {
      id: 'win_rate_80',
      name: '승률 달인',
      description: '80% 이상 승률 (10게임 이상)',
      icon: '📈',
      earned: stats.winRate >= 80 && stats.totalGames >= 10
    },
    {
      id: 'win_rate_90',
      name: '승률 마스터',
      description: '90% 이상 승률 (20게임 이상)',
      icon: '💎',
      earned: stats.winRate >= 90 && stats.totalGames >= 20
    }
  ];

  return badges;
}

/**
 * 다음 목표 제안
 * @param stats - 현재 통계
 * @returns 다음 목표 정보
 */
export function suggestNextGoal(stats: GameStats): {
  type: 'wins' | 'streak' | 'winrate' | 'games';
  current: number;
  target: number;
  description: string;
} | null {
  // 승리 수 목표
  if (stats.wins < 10) {
    return {
      type: 'wins',
      current: stats.wins,
      target: 10,
      description: '10승 달성하기'
    };
  }
  
  // 연승 목표
  if (stats.maxStreak < 5) {
    return {
      type: 'streak',
      current: stats.maxStreak,
      target: 5,
      description: '5연승 달성하기'
    };
  }
  
  // 승률 목표 (10게임 이상 플레이한 경우)
  if (stats.totalGames >= 10 && stats.winRate < 80) {
    return {
      type: 'winrate',
      current: stats.winRate,
      target: 80,
      description: '승률 80% 달성하기'
    };
  }
  
  return null;
}
