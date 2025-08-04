import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 미들웨어
 * API 라우트에 대한 관리자 권한 검증을 수행합니다.
 */
export function middleware(request: NextRequest) {
  // API 라우트만 처리
  if (request.nextUrl.pathname.startsWith('/api/user/')) {
    // 관리자 권한 검증은 각 API 엔드포인트에서 수행하므로
    // 여기서는 기본적인 보안 헤더만 추가
    const response = NextResponse.next();
    
    // 보안 헤더 추가
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }
  
  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 */
export const config = {
  matcher: [
    '/api/user/:path*',
  ],
}; 