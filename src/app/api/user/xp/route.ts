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
 * 경험치 증가 API
 * POST /api/user/xp
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
    const { amount, reason } = await request.json();

    console.log(`💫 경험치 추가 요청: ${amount}XP (${reason})`);

    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    // 현재 사용자 정보 조회
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 새로운 총 경험치 계산
    const newTotalXp = user.totalXp + amount;
    const { level, currentXp } = calculateLevelFromTotalXp(newTotalXp);

    // 레벨업 체크
    const leveledUp = level > user.level;

    // 사용자 정보 업데이트
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          totalXp: newTotalXp,
          currentXp: currentXp,
          level: level,
          updatedAt: new Date(),
        }
      }
    );

    console.log(`✅ 경험치 추가 완료: ${amount}XP → 레벨 ${level} (${currentXp}/${getRequiredXpForLevel(level)})`);

    if (leveledUp) {
      console.log(`🎉 레벨업! ${user.level} → ${level}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        level,
        currentXp,
        totalXp: newTotalXp,
        leveledUp,
        requiredXpForNextLevel: getRequiredXpForLevel(level + 1)
      }
    });

  } catch (error) {
    console.error('❌ 경험치 추가 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 현재 경험치 조회 API
 * GET /api/user/xp
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

    return NextResponse.json({
      success: true,
      data: {
        level: user.level,
        currentXp: user.currentXp,
        totalXp: user.totalXp,
        requiredXpForNextLevel: getRequiredXpForLevel(user.level + 1)
      }
    });

  } catch (error) {
    console.error('❌ 경험치 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 