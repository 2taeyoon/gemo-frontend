/**
 * 출석체크 관련 유틸리티 함수들
 */

import type { AttendanceStatus } from '@/types/user';

/**
 * 연속 출석에 따른 총 경험치 계산 (기본 50XP + 보너스 XP)
 * 새로운 보상 체계에 따라 특정 연속 출석 일수마다 보너스 지급
 * @param consecutiveDays - 연속 출석 일수
 * @returns 총 획득 경험치 (기본 + 보너스)
 */
export function calculateAttendanceXp(consecutiveDays: number): number {
  const baseXp = 50; // 기본 경험치
  let bonusXp = 0; // 보너스 경험치 초기화
  
  // 연속 출석 일수에 따른 보너스 XP 계산
  if (consecutiveDays >= 30) {
    bonusXp = 500; // 30일 연속: 500XP 보너스
  } else if (consecutiveDays >= 21) {
    bonusXp = 400; // 21일 연속: 400XP 보너스
  } else if (consecutiveDays >= 14) {
    bonusXp = 300; // 14일 연속: 300XP 보너스
  } else if (consecutiveDays >= 7) {
    bonusXp = 200; // 7일 연속: 200XP 보너스
  } else if (consecutiveDays >= 3) {
    bonusXp = 100; // 3일 연속: 100XP 보너스
  } else {
    bonusXp = 0; // 1~2일: 보너스 없음, 기본 50XP만
  }
  
  return baseXp + bonusXp; // 총 경험치 반환
}

/**
 * 다음 보상까지의 일수 계산
 * 새로운 보상 체계의 마일스톤에 따라 계산
 * @param consecutiveDays - 현재 연속 출석 일수
 * @returns 다음 보상까지 남은 일수 (모든 보상 달성 시 0)
 */
export function getDaysToNextReward(consecutiveDays: number): number {
  // 새로운 보상 마일스톤: 3일, 7일, 14일, 21일, 30일
  const rewards = [3, 7, 14, 21, 30];
  
  for (const reward of rewards) {
    if (consecutiveDays < reward) {
      return reward - consecutiveDays;
    }
  }
  
  return 0; // 모든 보상 달성 (30일 이상)
}

/**
 * 출석 보상 정보 배열 생성
 * @returns 출석 보상 정보 배열
 */
export function getAttendanceRewards() {
  return [
    { days: 1, desc: "기본 50 XP" },
    { days: 3, desc: "150 XP (기본 50 + 보너스 100)" },
    { days: 7, desc: "250 XP (기본 50 + 보너스 200)" },
    { days: 14, desc: "350 XP (기본 50 + 보너스 300)" },
    { days: 21, desc: "450 XP (기본 50 + 보너스 400)" },
    { days: 30, desc: "550 XP (기본 50 + 보너스 500)" }
  ];
}

/**
 * 오늘 출석했는지 확인
 * @param lastAttendance - 마지막 출석 날짜 (YYYY-MM-DD 형식)
 * @returns 오늘 출석 여부
 */
export function hasCheckedTodayAttendance(lastAttendance: string | null): boolean {
  if (!lastAttendance) return false;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
  return lastAttendance === today;
}

/**
 * 연속 출석 일수 계산
 * @param lastAttendance - 마지막 출석 날짜
 * @param currentStreak - 현재 연속 출석 일수
 * @returns 새로운 연속 출석 일수
 */
export function calculateNewAttendanceStreak(
  lastAttendance: string | null, 
  currentStreak: number
): number {
  if (!lastAttendance) return 1; // 첫 출석
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastAttendanceDate = new Date(lastAttendance);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // 어제 출석했으면 연속 출석 +1, 아니면 1로 초기화
  if (lastAttendance === yesterdayStr) {
    return currentStreak + 1;
  } else {
    return 1;
  }
}

/**
 * 출석체크 가능 여부 확인
 * @param attendanceStatus - 출석체크 상태
 * @returns 출석체크 가능 여부와 사유
 */
export function canCheckAttendance(attendanceStatus: AttendanceStatus): {
  canCheck: boolean;
  reason?: string;
} {
  if (attendanceStatus.hasCheckedToday) {
    return {
      canCheck: false,
      reason: '오늘 이미 출석체크를 완료했습니다.'
    };
  }
  
  return { canCheck: true };
}

/**
 * 출석 상태 메시지 생성
 * @param attendanceStatus - 출석체크 상태
 * @returns 상태에 따른 메시지
 */
export function getAttendanceStatusMessage(attendanceStatus: AttendanceStatus): string {
  if (attendanceStatus.hasCheckedToday) {
    return `오늘 출석체크 완료! 연속 ${attendanceStatus.consecutiveAttendance}일째`;
  } else {
    const expectedXp = calculateAttendanceXp(attendanceStatus.consecutiveAttendance + 1);
    return `출석체크하고 ${expectedXp} XP를 받아보세요!`;
  }
}

/**
 * 다음 보상 정보 생성
 * @param consecutiveDays - 현재 연속 출석 일수
 * @returns 다음 보상 정보
 */
export function getNextRewardInfo(consecutiveDays: number): {
  hasNextReward: boolean;
  daysLeft?: number;
  rewardXp?: number;
} {
  const daysLeft = getDaysToNextReward(consecutiveDays);
  
  if (daysLeft === 0) {
    return { hasNextReward: false };
  }
  
  const nextMilestone = consecutiveDays + daysLeft;
  const rewardXp = calculateAttendanceXp(nextMilestone);
  
  return {
    hasNextReward: true,
    daysLeft,
    rewardXp
  };
}
