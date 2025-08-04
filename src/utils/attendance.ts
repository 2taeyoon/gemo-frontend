// 출석체크 관련 유틸리티 함수들

/**
 * 연속 출석에 따른 총 경험치 계산 (기본 50XP + 보너스 XP)
 * 새로운 보상 체계에 따라 특정 연속 출석 일수마다 보너스 지급
 * @param consecutiveDays - 연속 출석 일수
 * @returns 총 획득 경험치 (기본 + 보너스)
 */
export const getBonusXp = (consecutiveDays: number): number => {
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
};

/**
 * 다음 보상까지의 일수 계산
 * 새로운 보상 체계의 마일스톤에 따라 계산
 * @param consecutiveDays - 현재 연속 출석 일수
 * @returns 다음 보상까지 남은 일수 (모든 보상 달성 시 0)
 */
export const getDaysToNextReward = (consecutiveDays: number): number => {
  // 새로운 보상 마일스톤: 3일, 7일, 14일, 21일, 30일
  const rewards = [3, 7, 14, 21, 30];
  
  for (const reward of rewards) {
    if (consecutiveDays < reward) {
      return reward - consecutiveDays;
    }
  }
  
  return 0; // 모든 보상 달성 (30일 이상)
};

/**
 * 출석체크 상태를 API에서 조회하는 함수
 */
export const fetchAttendanceStatus = async (): Promise<any> => {
  try {
    const response = await fetch('/api/user/attendance');
    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      console.error('출석체크 상태 조회 실패:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('출석체크 상태 조회 중 오류:', error);
    throw error;
  }
};

/**
 * 한국 시간 기준 오늘 날짜 문자열 생성
 * @returns 오늘 날짜 문자열 (YYYY-MM-DD 형식)
 */
export const getTodayString = (): string => {
  return new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
    .replace(/\. /g, '-').replace('.', '').replace(/\s/g, '');
};

/**
 * 어제 날짜 문자열 생성
 * @returns 어제 날짜 문자열 (YYYY-MM-DD 형식)
 */
export const getYesterdayString = (): string => {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}; 