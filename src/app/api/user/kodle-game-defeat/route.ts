import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
 * 코들 게임 패배 처리 API
 * POST /api/user/kodle-game-defeat
 * 
 * 기능:
 * 1. kodleGameDefeat (총 패배 횟수) 증가
 * 2. kodleSuccessiveVictory (연속 승리) 0으로 초기화
 * 3. 패배 시에는 경험치 지급하지 않음 (추후 위로 경험치 등 고려 가능)
 */
export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    // 🔍 디버깅 로그 추가
    console.log('🔍 kodle-game-defeat API 디버깅:');
    console.log('  - session.user:', session.user);
    console.log('  - userId:', userId);
    console.log('  - userId type:', typeof userId);
    
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    // 현재 사용자 정보 조회
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // 🔍 사용자 조회 결과 로그
    console.log('  - MongoDB 조회 결과:', user ? '✅ 사용자 발견' : '❌ 사용자 없음');
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 게임 통계 가져오기 (새로운 구조 우선, 기존 구조 fallback)
    const currentKodleGameDefeat = user.gameData?.kodleGameDefeat || 0;
    const currentKodleGameWins = user.gameData?.kodleGameWins || user.gameData?.gameWins || 0;
    const currentKodleSuccessiveVictory = user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0;

    // 새로운 값들 계산
    const newKodleGameDefeat = currentKodleGameDefeat + 1;
    const newKodleSuccessiveVictory = 0; // 패배 시 연속 승리 초기화

    console.log(`💔 코들 게임 패배 처리: ${user.email}`);
    console.log(`  - 총 패배: ${currentKodleGameDefeat} → ${newKodleGameDefeat}`);
    console.log(`  - 연속 승리: ${currentKodleSuccessiveVictory} → ${newKodleSuccessiveVictory} (초기화)`);

    // 게임 통계 업데이트 (새로운 구조 + 하위 호환성)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          // 새로운 코들 게임 구조
          'gameData.kodleGameDefeat': newKodleGameDefeat,
          'gameData.kodleSuccessiveVictory': newKodleSuccessiveVictory,
          
          // 하위 호환성을 위한 기존 필드들
          'gameData.consecutiveWins': newKodleSuccessiveVictory,
          
          // 마지막 업데이트 시간
          updatedAt: new Date(),
        }
      }
    );

    // 응답 데이터 구성
    const responseData = {
      kodleGameDefeat: newKodleGameDefeat,
      kodleGameWins: currentKodleGameWins, // 승리 횟수도 포함 (패배해도 승리 횟수는 변하지 않음)
      kodleSuccessiveVictory: newKodleSuccessiveVictory,
      kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
      // 패배 시에는 경험치 변동 없음
      level: user.gameData?.level || 1,
      currentXp: user.gameData?.currentXp || 0,
      totalXp: user.gameData?.totalXp || 0,
    };

    console.log(`✅ 코들 게임 패배 처리 완료: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: '코들 게임 패배가 기록되었습니다.',
      data: responseData
    });

  } catch (error) {
    console.error('❌ 코들 게임 패배 처리 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 코들 게임 패배 정보 조회 API
 * GET /api/user/kodle-game-defeat
 * 코들 게임 패배와 관련된 통계 정보만 반환합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    console.log('🔍 [GET kodle-game-defeat] 코들 게임 패배 정보 조회:');
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

    console.log('✅ 코들 게임 패배 정보 조회 성공:', user.email);

    // 코들 게임 패배 관련 데이터만 반환
    return NextResponse.json({
      success: true,
      data: {
        kodleGameDefeat: user.gameData?.kodleGameDefeat || 0,
        kodleGameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
        kodleSuccessiveVictory: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
      }
    });

  } catch (error) {
    console.error('❌ 코들 게임 패배 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 