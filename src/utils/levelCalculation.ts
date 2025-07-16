/**
 * 레벨 계산 관련 유틸리티 함수들
 */

/**
 * 레벨별 필요한 경험치를 계산하는 함수 (단계별 시스템)
 */
export function getRequiredXpForLevel(level: number): number {
  // 1~9레벨: 초보자 구간
  if (level >= 1 && level <= 9) {
    const xpList = [100, 150, 200, 250, 300, 350, 400, 450, 800];
    return xpList[level - 1];
  }
  
  // 10~19레벨: 중급자 구간
  if (level >= 10 && level <= 19) {
    const xpList = [900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1500];
    return xpList[level - 10];
  }
  
  // 20레벨 이상: 패턴 기반 계산
  const tier = Math.floor(level / 10); // 2, 3, 4, ... (20~29: 2, 30~39: 3)
  const posInTier = level % 10; // 0~9 (20: 0, 21: 1, ..., 29: 9)
  
  if (tier >= 2) {
    // 각 구간별 기본값과 증가량 설정
    const baseXp = 1600 + (tier - 2) * 300; // 20레벨: 1600, 30레벨: 1900, 40레벨: 2200...
    const increment = 60 + (tier - 2) * 10; // 20~29: 60씩, 30~39: 70씩, 40~49: 80씩...
    
    if (posInTier === 9) { // 29, 39, 49... 레벨 (점프)
      return baseXp + 8 * increment + Math.floor(baseXp * 0.2); // 20% 점프
    } else {
      return baseXp + posInTier * increment;
    }
  }
  
  // 500레벨 넘어가면 최대값 고정
  return 50000;
}

/**
 * 총 경험치로부터 레벨과 현재 레벨 경험치 계산
 */
export function calculateLevelFromTotalXp(totalXp: number): { level: number; currentXp: number } {
  let level = 1;
  let accumulatedXp = 0;
  
  while (accumulatedXp + getRequiredXpForLevel(level) <= totalXp) {
    accumulatedXp += getRequiredXpForLevel(level);
    level++;
  }
  
  const currentXp = totalXp - accumulatedXp;
  return { level, currentXp };
} 