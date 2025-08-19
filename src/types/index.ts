/**
 * 타입 정의 인덱스 파일
 * 모든 타입들을 중앙에서 관리하고 쉽게 import할 수 있도록 합니다.
 */

// 인증 관련 타입
export * from './auth';

// 사용자 관련 타입
export * from './user';

// 게임 관련 타입
export * from './game';

// API 관련 타입
export * from './api';

// Kodle 게임 전용 타입
export * from './kodle';

// 추가 공통 타입들
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  children?: NavigationItem[];
}

export interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  retry?: () => void;
}
