import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getRequiredXpForLevel, calculateLevelFromTotalXp } from '@/utils/levelCalculation';

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
    const newTotalXp = (user.gameData?.totalXp || 0) + amount;
    const { level, currentXp } = calculateLevelFromTotalXp(newTotalXp);

    // 레벨업 체크
    const leveledUp = level > (user.gameData?.level || 1);

    // 사용자 정보 업데이트 (gameData 구조)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'gameData.totalXp': newTotalXp,
          'gameData.currentXp': currentXp,
          'gameData.level': level,
          updatedAt: new Date(),
        }
      }
    );

    console.log(`✅ 경험치 추가 완료: ${amount}XP → 레벨 ${level} (${currentXp}/${getRequiredXpForLevel(level)})`);

    if (leveledUp) {
      console.log(`🎉 레벨업! ${user.gameData?.level || 1} → ${level}`);
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