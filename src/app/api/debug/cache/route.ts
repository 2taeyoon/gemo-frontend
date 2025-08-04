import { NextRequest, NextResponse } from 'next/server';
import { memoryCache } from '@/lib/cache';

/**
 * 캐시 상태 확인 API (개발용)
 * GET /api/debug/cache
 */
export async function GET(request: NextRequest) {
  // 개발 환경에서만 접근 가능
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '프로덕션 환경에서는 접근할 수 없습니다.' },
      { status: 403 }
    );
  }

  try {
    return NextResponse.json({
      success: true,
      data: {
        cacheSize: memoryCache.size(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('캐시 상태 확인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 캐시 초기화 API (개발용)
 * POST /api/debug/cache
 */
export async function POST(request: NextRequest) {
  // 개발 환경에서만 접근 가능
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '프로덕션 환경에서는 접근할 수 없습니다.' },
      { status: 403 }
    );
  }

  try {
    memoryCache.clear();
    
    return NextResponse.json({
      success: true,
      message: '캐시가 초기화되었습니다.',
      data: {
        cacheSize: memoryCache.size(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('캐시 초기화 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 