/**
 * 한국 시간으로 현재 날짜를 생성합니다
 */
export function getKoreanDate(): Date {
  const now = new Date();
  // 한국 시간 (UTC+9) 으로 변환
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return koreanTime;
}

/**
 * 날짜를 한국어 형식으로 포맷합니다
 * 예: "2025년 07월 10일"
 */
export function formatKoreanDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 날짜를 한국어 형식으로 포맷합니다 (시간 포함)
 * 예: "2025년 07월 10일 13시 01분 32초"
 */
export function formatKoreanDateTime(date: Date): string {
  const dateStr = formatKoreanDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${dateStr} ${hours}시 ${minutes}분 ${seconds}초`;
}

/**
 * UTC 날짜를 한국 시간으로 변환합니다
 */
export function toKoreanTime(utcDate: Date): Date {
  const koreanTime = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
  return koreanTime;
} 