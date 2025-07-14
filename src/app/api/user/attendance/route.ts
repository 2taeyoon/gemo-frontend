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
 * 레벨별 필요 경험치 계산
 */
function getRequiredXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

/**
 * 총 경험치로부터 레벨과 현재 레벨 경험치 계산
 */
function calculateLevelFromTotalXp(totalXp: number): { level: number; currentXp: number } {
  let level = 1;
  let accumulatedXp = 0;
  
  while (accumulatedXp + getRequiredXpForLevel(level) <= totalXp) {
    accumulatedXp += getRequiredXpForLevel(level);
    level++;
  }
  
  const currentXp = totalXp - accumulatedXp;
  return { level, currentXp };
}

/**
 * 출석체크 API
 * POST /api/user/attendance
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 한국 시간 기준 오늘 날짜
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
      .replace(/\. /g, '-').replace('.', '').replace(/\s/g, '');

    // 이미 출석체크 했는지 확인
    if (user.lastAttendance === today) {
      return NextResponse.json({
        success: false,
        error: '이미 오늘 출석체크를 완료했습니다.',
        data: {
          alreadyChecked: true,
          consecutiveAttendance: user.consecutiveAttendance
        }
      });
    }

    // 연속 출석 계산
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
      .replace(/\. /g, '-').replace('.', '').replace(/\s/g, '');

    let newConsecutiveAttendance = 1;
    if (user.lastAttendance === yesterdayStr) {
      newConsecutiveAttendance = user.consecutiveAttendance + 1;
    }

    // 출석체크 경험치 계산 (연속 출석 보너스 포함)
    const baseXp = 10;
    const bonusXp = Math.min(newConsecutiveAttendance * 2, 50);
    const totalXp = baseXp + bonusXp;

    // 새로운 총 경험치 계산
    const newTotalUserXp = user.totalXp + totalXp;
    const { level, currentXp } = calculateLevelFromTotalXp(newTotalUserXp);

    // 레벨업 체크
    const leveledUp = level > user.level;

    // 출석체크 및 경험치 업데이트
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          lastAttendance: today,
          consecutiveAttendance: newConsecutiveAttendance,
          totalXp: newTotalUserXp,
          currentXp: currentXp,
          level: level,
          updatedAt: new Date(),
        }
      }
    );

    console.log(`📅 출석체크 완료: ${user.email}, 연속 ${newConsecutiveAttendance}일, ${totalXp}XP 획득`);

    if (leveledUp) {
      console.log(`🎉 레벨업! ${user.level} → ${level}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        consecutiveAttendance: newConsecutiveAttendance,
        xpGained: totalXp,
        baseXp,
        bonusXp,
        level,
        currentXp,
        totalXp: newTotalUserXp,
        leveledUp
      }
    });

  } catch (error) {
    console.error('❌ 출석체크 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 출석 정보 조회 API
 * GET /api/user/attendance
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 오늘 출석체크 했는지 확인
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
      .replace(/\. /g, '-').replace('.', '').replace(/\s/g, '');

    const hasCheckedToday = user.lastAttendance === today;

    return NextResponse.json({
      success: true,
      data: {
        lastAttendance: user.lastAttendance,
        consecutiveAttendance: user.consecutiveAttendance,
        hasCheckedToday
      }
    });

  } catch (error) {
    console.error('❌ 출석 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 