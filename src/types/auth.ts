// 인증 관련 타입 정의

export interface AuthProps {
  children: React.ReactNode;
}

export interface SessionWrapperProps {
  children: React.ReactNode;
}

export interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface AuthSession {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    superAdmin?: boolean;
  };
  expires: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
} 