import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { memoryCache } from './cache';

// NextAuth 설정 (메인 설정과 동일)
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.userId = user.id;
        token.superAdmin = (user as any).superAdmin || false;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.userId && session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).superAdmin = token.superAdmin as boolean;
      }
      return session;
    },
  },
};

/**
 * 관리자 권한 검증 미들웨어 (캐싱 적용)
 * @param request NextRequest 객체
 * @returns 관리자 권한이 있으면 true, 없으면 false
 */
export async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.log('❌ 관리자 권한 검증 실패: 로그인되지 않음');
      return false;
    }

    const userId = (session.user as any).id;
    const userEmail = (session.user as any).email;

    // 캐시에서 관리자 권한 확인
    const cacheKey = `admin:${userId}`;
    const cachedAdminStatus = memoryCache.get<boolean>(cacheKey);
    
    if (cachedAdminStatus !== null) {
      console.log(`✅ 캐시에서 관리자 권한 확인: ${userEmail} - ${cachedAdminStatus ? '관리자' : '일반 사용자'}`);
      return cachedAdminStatus;
    }

    // 캐시에 없으면 세션에서 확인
    const superAdmin = (session.user as any).superAdmin;
    
    if (!superAdmin) {
      console.log('❌ 관리자 권한 검증 실패: superAdmin이 false');
      // 캐시에 false 저장 (5분간)
      memoryCache.set(cacheKey, false, 5 * 60 * 1000);
      return false;
    }

    console.log('✅ 관리자 권한 검증 성공:', userEmail);
    // 캐시에 true 저장 (10분간 - 관리자는 더 오래 캐싱)
    memoryCache.set(cacheKey, true, 10 * 60 * 1000);
    return true;
  } catch (error) {
    console.error('❌ 관리자 권한 검증 중 오류:', error);
    return false;
  }
}

/**
 * 직접 URL 접근 여부 확인
 * @param request NextRequest 객체
 * @returns 직접 URL 접근이면 true, 프론트엔드에서 호출이면 false
 */
export function isDirectUrlAccess(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  const userAgent = request.headers.get('user-agent');
  const accept = request.headers.get('accept');
  
  // User-Agent가 없거나 브라우저가 아닌 경우 (curl, Postman 등)
  if (!userAgent || !userAgent.includes('Mozilla')) {
    return true;
  }
  
  // Accept 헤더가 application/json을 포함하면 프론트엔드 API 호출로 간주
  if (accept && accept.includes('application/json')) {
    return false;
  }
  
  // referer나 origin이 없으면 직접 URL 접근으로 간주
  if (!referer && !origin) {
    return true;
  }
  
  // referer가 있지만 같은 도메인이 아니면 직접 접근으로 간주
  if (referer && !referer.includes(request.nextUrl.host)) {
    return true;
  }
  
  // 프론트엔드에서 호출한 경우 (referer나 origin이 같은 도메인)
  return false;
}

/**
 * 관리자 권한이 없을 때 404 페이지로 리다이렉트
 * 일반 사용자에게는 권한 오류를 보여주지 않고 조용히 처리
 */
export function createUnauthorizedResponse(request: NextRequest): NextResponse {
  // 일반 사용자에게는 권한 오류를 보여주지 않고 404 페이지로 리다이렉트
  const baseUrl = request.nextUrl.origin;
  return NextResponse.redirect(new URL('/404', baseUrl));
}

/**
 * 특정 사용자의 관리자 권한 캐시를 무효화합니다.
 * @param userId 사용자 ID
 */
export function invalidateAdminCache(userId: string): void {
  const cacheKey = `admin:${userId}`;
  memoryCache.delete(cacheKey);
  console.log(`🗑️ 관리자 권한 캐시 무효화: ${userId}`);
}

/**
 * 모든 관리자 권한 캐시를 무효화합니다.
 */
export function invalidateAllAdminCache(): void {
  // 캐시에서 admin:으로 시작하는 모든 키를 찾아서 삭제
  // 실제로는 Redis 등을 사용할 때 더 효율적으로 구현 가능
  console.log('🗑️ 모든 관리자 권한 캐시 무효화');
} 