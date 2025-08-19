/**
 * 인증 관련 타입 정의
 */

// NextAuth 사용자 세션 타입
export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// NextAuth 세션 타입
export interface AuthSession {
  user?: AuthUser;
  expires: string;
}

// 로그인 제공자 타입
export interface AuthProvider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

// 로그인 제공자 목록 타입
export interface AuthProviders {
  [key: string]: AuthProvider;
}

// 로그인 상태 타입
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// 로그인 에러 타입
export interface AuthError {
  type: string;
  message: string;
}

// OAuth 설정 타입
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  issuer?: string;
  authorization?: string;
  token?: string;
  userinfo?: string;
}
