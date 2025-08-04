import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyAdminAccess, createUnauthorizedResponse, isDirectUrlAccess } from '@/lib/adminAuth';

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
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token?.userId && session.user) {
        (session.user as any).id = token.userId as string;
      }
      return session;
    },
  },
};

/**
 * 연승 초기화 및 패배 처리 API
 * POST /api/user/reset-win-streak
 * 사용자의 연승 기록을 초기화하고 패배 횟수를 증가시킵니다.
 * 
 * 기능:
 * 1. kodleGameDefeat (총 패배 횟수) 증가
 * 2. kodleSuccessiveVictory (연속 승리) 0으로 초기화
 */
export async function POST(request: NextRequest) {
  try {
    // 직접 URL 접근인 경우에만 관리자 권한 확인
    if (isDirectUrlAccess(request)) {
      const isAdmin = await verifyAdminAccess(request);
      if (!isAdmin) {
        return createUnauthorizedResponse(request);
      }
    }

    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    // 현재 사용자 정보 조회 (새로운 구조 적용을 위해)
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 게임 통계 가져오기
    const currentKodleGameWins = user.gameData?.kodleGameWins || user.gameData?.gameWins || 0;
    const currentKodleGameDefeat = user.gameData?.kodleGameDefeat || 0;
    const newKodleGameDefeat = currentKodleGameDefeat + 1;

    console.log(`💔 코들 게임 패배 처리 (하위 호환성 API): ${user.email}`);
    console.log(`  - 총 승리: ${currentKodleGameWins}회 (변화 없음)`);
    console.log(`  - 총 패배: ${currentKodleGameDefeat} → ${newKodleGameDefeat}회`);
    console.log(`  - 연속 승리: 초기화 (0으로 설정)`);

    // 패배 처리 및 연승 초기화 (새로운 구조 + 하위 호환성)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          // 새로운 코들 게임 구조
          'gameData.kodleGameDefeat': newKodleGameDefeat,
          'gameData.kodleSuccessiveVictory': 0,
          
          // 하위 호환성을 위한 기존 필드들
          'gameData.consecutiveWins': 0,
          
          // 마지막 업데이트 시간
          updatedAt: new Date(),
        } 
      }
    );

          return NextResponse.json({
        success: true,
        message: '코들 게임 패배가 기록되었습니다.',
        data: {
          // 하위 호환성을 위한 기존 필드들
          gameWins: currentKodleGameWins,
          consecutiveWins: 0,
          // 새로운 필드들
          kodleGameWins: currentKodleGameWins,
          kodleGameDefeat: newKodleGameDefeat,
          kodleSuccessiveVictory: 0,
          kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
        }
      });

  } catch (error) {
    console.error('연승 초기화 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 연승 정보 조회 API
 * GET /api/user/reset-win-streak
 * 연승과 관련된 통계 정보만 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // 직접 URL 접근인 경우에만 관리자 권한 확인
    if (isDirectUrlAccess(request)) {
      const isAdmin = await verifyAdminAccess(request);
      if (!isAdmin) {
        return createUnauthorizedResponse(request);
      }
    }

    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    console.log('🔍 [GET reset-win-streak] 연승 정보 조회:');
    console.log('  - userId:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID를 찾을 수 없습니다.' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    // ObjectId 유효성 검사
    if (!ObjectId.isValid(userId)) {
      console.log('  - ❌ 유효하지 않은 ObjectId:', userId);
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID입니다.' },
        { status: 400 }
      );
    }

    // 현재 사용자 정보 조회
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 연승 정보 조회 성공:', user.email);

    // 연승 관련 데이터만 반환
    return NextResponse.json({
      success: true,
      data: {
        kodleSuccessiveVictory: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
        kodleGameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
        kodleGameDefeat: user.gameData?.kodleGameDefeat || 0,
        // 하위 호환성
        consecutiveWins: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        gameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
      }
    });

  } catch (error) {
    console.error('❌ 연승 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 