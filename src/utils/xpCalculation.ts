/**
 * 경험치 계산 관련 유틸리티 함수들
 * 연승에 따른 경험치 시스템 구현
 */

export interface XpCalculationResult {
  baseXp: number;
  streakBonus: number;
  totalXp: number;
  streakLevel: number;
  isDefeat?: boolean;
}

/**
 * 코들 게임 승리 시 경험치 계산
 * 연승에 따른 보너스 경험치 적용
 * 
 * 계산 로직:
 * - 1승: 기본 100xp
 * - 2연승: 100xp + (100xp * 20%) = 120xp
 * - 3연승: 120xp + (120xp * 20%) = 144xp → 반올림하여 144xp
 * - 4연승: 144xp + (144xp * 20%) = 172.8xp → 반올림하여 173xp
 * - 5연승: 173xp + (173xp * 20%) = 207.6xp → 반올림하여 208xp
 * - 6연승: 208xp + (208xp * 20%) = 249.6xp → 반올림하여 250xp
 * - 7연승: 250xp + (250xp * 20%) = 300xp
 * - 8연승: 300xp + (300xp * 20%) = 360xp
 * - 9연승: 360xp + (360xp * 20%) = 432xp
 * - 10연승: 432xp + (432xp * 50%) = 648xp → 특별 보너스로 825xp
 * - 11연승 이상: 고정 825xp
 * 
 * @param currentWinStreak - 현재 연속 승리 횟수 (이번 승리 포함)
 * @returns 경험치 계산 결과
 */
export function calculateKodleWinXp(currentWinStreak: number): XpCalculationResult {
  const baseXp = 100; // 기본 경험치
  
  if (currentWinStreak === 1) {
    return {
      baseXp,
      streakBonus: 0,
      totalXp: baseXp,
      streakLevel: 1
    };
  }
  
  // 10연승 이상은 고정 825xp
  if (currentWinStreak >= 11) {
    return {
      baseXp,
      streakBonus: 725,
      totalXp: 825,
      streakLevel: currentWinStreak
    };
  }
  
  // 10연승은 특별 계산 (9연승 xp + 50% 보너스가 아닌 고정 825xp)
  if (currentWinStreak === 10) {
    return {
      baseXp,
      streakBonus: 725,
      totalXp: 825,
      streakLevel: 10
    };
  }
  
  // 2-9연승: 이전 연승의 경험치에 20% 보너스 적용
  let totalXp = baseXp;
  
  for (let streak = 2; streak <= currentWinStreak; streak++) {
    const bonus = Math.round(totalXp * 0.2); // 20% 보너스, 반올림
    totalXp = totalXp + bonus;
  }
  
  return {
    baseXp,
    streakBonus: totalXp - baseXp,
    totalXp: Math.round(totalXp),
    streakLevel: currentWinStreak
  };
}

/**
 * 코들 게임 패배 시 경험치 계산
 * @returns 패배 시 경험치 (고정 20xp)
 */
export function calculateKodleDefeatXp(): XpCalculationResult {
  return {
    baseXp: 20,
    streakBonus: 0,
    totalXp: 20,
    streakLevel: 0,
    isDefeat: true
  };
}

/**
 * 연승 단계별 경험치 미리 계산한 테이블
 * 성능 최적화를 위해 사용
 */
export const STREAK_XP_TABLE: Record<number, number> = {
  1: 100,   // 기본
  2: 120,   // 100 + 20
  3: 144,   // 120 + 24
  4: 173,   // 144 + 28.8 → 29 (반올림)
  5: 208,   // 173 + 34.6 → 35 (반올림)
  6: 250,   // 208 + 41.6 → 42 (반올림)
  7: 300,   // 250 + 50
  8: 360,   // 300 + 60
  9: 432,   // 360 + 72
  10: 825,  // 특별 보너스
  11: 825,  // 고정
};

/**
 * 테이블을 사용한 빠른 경험치 계산
 * @param currentWinStreak - 현재 연속 승리 횟수
 * @returns 경험치 계산 결과
 */
export function calculateKodleWinXpFast(currentWinStreak: number): XpCalculationResult {
  const totalXp = STREAK_XP_TABLE[Math.min(currentWinStreak, 11)] || 825;
  
  return {
    baseXp: 100,
    streakBonus: totalXp - 100,
    totalXp,
    streakLevel: currentWinStreak
  };
}

/**
 * 연승 단계별 보상 정보 생성
 * @returns 연승 보상 정보 배열
 */
export function getStreakRewards() {
  const rewards = [];
  
  for (let streak = 1; streak <= 11; streak++) {
    const xp = STREAK_XP_TABLE[streak];
    let description = '';
    
    if (streak === 1) {
      description = '기본 경험치';
    } else if (streak <= 9) {
      description = `${streak}연승 보너스 (+20%)`;
    } else if (streak === 10) {
      description = '10연승 특별 보너스!';
    } else {
      description = '11연승 이상 고정 보상';
    }
    
    rewards.push({
      streak,
      xp,
      description,
      isSpecial: streak === 10
    });
  }
  
  return rewards;
}

/**
 * 다음 연승 목표까지의 정보 계산
 * @param currentStreak - 현재 연속 승리 횟수
 * @returns 다음 목표 정보
 */
export function getNextStreakGoal(currentStreak: number): {
  hasNext: boolean;
  nextStreak?: number;
  nextXp?: number;
  additionalXp?: number;
} {
  if (currentStreak >= 11) {
    return { hasNext: false };
  }
  
  const milestones = [1, 2, 3, 5, 7, 10, 11];
  const nextMilestone = milestones.find(m => m > currentStreak);
  
  if (!nextMilestone) {
    return { hasNext: false };
  }
  
  const currentXp = STREAK_XP_TABLE[currentStreak] || 0;
  const nextXp = STREAK_XP_TABLE[nextMilestone];
  
  return {
    hasNext: true,
    nextStreak: nextMilestone,
    nextXp,
    additionalXp: nextXp - currentXp
  };
}

/**
 * 경험치 획득 메시지 생성
 * @param result - 경험치 계산 결과
 * @returns 사용자에게 표시할 메시지
 */
export function generateXpMessage(result: XpCalculationResult): string {
  if (result.isDefeat) {
    return `아쉽지만 패배했습니다. ${result.totalXp} XP를 획득했습니다.`;
  }
  
  if (result.streakLevel === 1) {
    return `첫 승리! ${result.totalXp} XP를 획득했습니다.`;
  }
  
  if (result.streakLevel === 10) {
    return `🎉 10연승 달성! 특별 보너스로 ${result.totalXp} XP를 획득했습니다!`;
  }
  
  if (result.streakLevel >= 11) {
    return `${result.streakLevel}연승 유지! ${result.totalXp} XP를 획득했습니다.`;
  }
  
  return `${result.streakLevel}연승! ${result.totalXp} XP (기본 ${result.baseXp} + 보너스 ${result.streakBonus})를 획득했습니다.`;
}
