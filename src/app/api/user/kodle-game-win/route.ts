import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { calculateLevelFromTotalXp } from '@/utils/levelCalculation';

// NextAuth 설정 (JWT 기반)
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
 * 코들 게임 승리 처리 API
 * POST /api/user/kodle-game-win
 * 
 * 기능:
 * 1. kodleGameWins (총 승리 횟수) 증가
 * 2. kodleSuccessiveVictory (연속 승리) 증가
 * 3. kodleMaximumSuccessiveVictory (최대 연속 승리 기록) 업데이트
 * 4. 게임 승리 시 경험치 지급 (100XP)
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
    console.log('🔍 kodle-game-win API 디버깅:');
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
    const currentKodleGameWins = user.gameData?.kodleGameWins || user.gameData?.gameWins || 0;
    const currentKodleSuccessiveVictory = user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0;
    const currentKodleMaximumSuccessiveVictory = user.gameData?.kodleMaximumSuccessiveVictory || 0;

    // 새로운 값들 계산
    const newKodleGameWins = currentKodleGameWins + 1;
    const newKodleSuccessiveVictory = currentKodleSuccessiveVictory + 1;
    
    // 최대 연속 승리 기록 업데이트 (현재 연속 승리가 기존 최대 기록을 넘었을 때만)
    const newKodleMaximumSuccessiveVictory = Math.max(newKodleSuccessiveVictory, currentKodleMaximumSuccessiveVictory);

    // 연승에 따른 경험치 계산
    const calculateKodleWinXp = (winStreak: number): number => {
      if (winStreak === 1) {
        return 100; // 기본 경험치
      }
      
      // 10연승 이상은 고정 825xp
      if (winStreak >= 10) {
        return 825;
      }
      
      // 2-9연승: 이전 연승의 경험치에 20% 보너스 적용하여 계산
      let totalXp = 100; // 1승 기본 경험치
      
      for (let streak = 2; streak <= winStreak; streak++) {
        if (streak === 10) {
          // 10연승은 특별 계산: 9연승xp + (9연승xp * 50%) = 825xp
          const prevXp = totalXp;
          totalXp = prevXp + Math.round(prevXp * 0.5);
        } else {
          // 2-9연승: 20% 보너스
          const bonus = totalXp * 0.2;
          totalXp = totalXp + Math.round(bonus);
        }
      }
      
      return totalXp;
    };
    
    const victoryXp = calculateKodleWinXp(newKodleSuccessiveVictory);
    const newTotalXp = (user.gameData?.totalXp || 0) + victoryXp;

    // 새로운 총 경험치를 바탕으로 레벨과 현재 레벨 경험치 계산
    const { level: newLevel, currentXp: newCurrentXp } = calculateLevelFromTotalXp(newTotalXp);
    
    // 레벨업 여부 확인
    const previousLevel = user.gameData?.level || 1;
    const leveledUp = newLevel > previousLevel;

    console.log(`🏆 코들 게임 승리 처리: ${user.email}`);
    console.log(`  - 총 승리: ${currentKodleGameWins} → ${newKodleGameWins}`);
    console.log(`  - 연속 승리: ${currentKodleSuccessiveVictory} → ${newKodleSuccessiveVictory}`);
    console.log(`  - 최대 연속 승리: ${currentKodleMaximumSuccessiveVictory} → ${newKodleMaximumSuccessiveVictory}`);
    console.log(`  - 경험치: +${victoryXp}XP 획득 (${newKodleSuccessiveVictory}연승)`);

    // 게임 통계 업데이트 (새로운 구조 + 하위 호환성)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          // 새로운 코들 게임 구조
          'gameData.kodleGameWins': newKodleGameWins,
          'gameData.kodleSuccessiveVictory': newKodleSuccessiveVictory,
          'gameData.kodleMaximumSuccessiveVictory': newKodleMaximumSuccessiveVictory,
          
          // 하위 호환성을 위한 기존 필드들
          'gameData.gameWins': newKodleGameWins,
          'gameData.consecutiveWins': newKodleSuccessiveVictory,
          
          // 경험치 및 레벨 업데이트
          'gameData.totalXp': newTotalXp,
          'gameData.currentXp': newCurrentXp,
          'gameData.level': newLevel,
          
          // 마지막 업데이트 시간
          updatedAt: new Date(),
        }
      }
    );

    // 응답 데이터 구성
    const responseData = {
      kodleGameWins: newKodleGameWins,
      kodleSuccessiveVictory: newKodleSuccessiveVictory,
      kodleMaximumSuccessiveVictory: newKodleMaximumSuccessiveVictory,
      xpGained: victoryXp,
      level: newLevel,
      currentXp: newCurrentXp,
      totalXp: newTotalXp,
      leveledUp: leveledUp,
    };

    console.log(`✅ 코들 게임 승리 처리 완료: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: '코들 게임 승리가 기록되었습니다!',
      data: responseData
    });

  } catch (error) {
    console.error('❌ 코들 게임 승리 처리 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 코들 게임 승리 정보 조회 API
 * GET /api/user/kodle-game-win
 * 코들 게임 승리와 관련된 통계 정보만 반환합니다.
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
    
    console.log('🔍 [GET kodle-game-win] 코들 게임 승리 정보 조회:');
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

    console.log('✅ 코들 게임 승리 정보 조회 성공:', user.email);

    // 코들 게임 승리 관련 데이터만 반환
    return NextResponse.json({
      success: true,
      data: {
        kodleGameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
        kodleGameDefeat: user.gameData?.kodleGameDefeat || 0,
        kodleSuccessiveVictory: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
        level: user.gameData?.level || 1,
        currentXp: user.gameData?.currentXp || 0,
        totalXp: user.gameData?.totalXp || 0,
      }
    });

  } catch (error) {
    console.error('❌ 코들 게임 승리 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 