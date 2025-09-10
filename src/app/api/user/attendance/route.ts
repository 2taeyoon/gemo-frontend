import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getRequiredXpForLevel, calculateLevelFromTotalXp } from '@/utils/levelCalculation';
import { checkSuperAdminAuth, createNotFoundRedirect } from '@/utils/adminAuth';

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
 * 출석체크 API
 * POST /api/user/attendance
 * 일반 사용자도 API 호출 가능
 */
export async function POST(request: NextRequest) {
  try {
    // 세션 확인 (일반 사용자도 접근 가능)
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID입니다.' },
        { status: 400 }
      );
    }

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

    // 현재 사용자의 출석 정보 확인
    const lastAttendance = user.gameData?.lastAttendance;
    const consecutiveAttendance = user.gameData?.consecutiveAttendance || 0;
    
    // 오늘 이미 출석했는지 확인
    if (lastAttendance === today) {
      return NextResponse.json(
        { error: '오늘은 이미 출석체크를 완료했습니다.' },
        { status: 400 }
      );
    }

    // 연속 출석 계산
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newConsecutiveAttendance = (lastAttendance === yesterday) 
      ? consecutiveAttendance + 1 
      : 1;

    // 경험치 계산 (기본 50XP + 연속출석 보너스)
    // 새로운 보상 체계: 특정 연속 출석 일수에 따른 보너스
    const baseXp = 50;
    let bonusXp = 0;
    
    // 연속 출석 일수에 따른 보너스 XP 계산
    if (newConsecutiveAttendance >= 30) {
      bonusXp = 500; // 30일 연속: 500XP 보너스
    } else if (newConsecutiveAttendance >= 21) {
      bonusXp = 400; // 21일 연속: 400XP 보너스
    } else if (newConsecutiveAttendance >= 14) {
      bonusXp = 300; // 14일 연속: 300XP 보너스
    } else if (newConsecutiveAttendance >= 7) {
      bonusXp = 200; // 7일 연속: 200XP 보너스
    } else if (newConsecutiveAttendance >= 3) {
      bonusXp = 100; // 3일 연속: 100XP 보너스
    } else {
      bonusXp = 0; // 1~2일: 보너스 없음, 기본 50XP만
    }
    
    const totalXp = baseXp + bonusXp;

    console.log(`📅 출석체크: 연속 ${newConsecutiveAttendance}일, ${totalXp}XP (기본 ${baseXp} + 보너스 ${bonusXp})`);

    // 새로운 총 경험치 계산
    const newTotalUserXp = (user.gameData?.totalXp || 0) + totalXp;
    const { level, currentXp } = calculateLevelFromTotalXp(newTotalUserXp);

    // 레벨업 체크
    const leveledUp = level > (user.gameData?.level || 1);

    // 업적 처리 로직
    const unlockedAchievements: { key: string; text: string }[] = [];
    const updateFields: any = {
      'gameData.lastAttendance': today,
      'gameData.consecutiveAttendance': newConsecutiveAttendance,
      'gameData.totalXp': newTotalUserXp,
      'gameData.currentXp': currentXp,
      'gameData.level': level,
      updatedAt: new Date(),
    };

    // 기존 사용자의 achievements 구조 확인 및 기본값 설정
    const defaultAchievements = {
      attendance: {
        d1: { completed: false, text: "첫 출석 완료! 연속 1일 달성" },
        d7: { completed: false, text: "연속 7일 출석 달성" },
        d14: { completed: false, text: "연속 14일 출석 달성" },
        d21: { completed: false, text: "연속 21일 출석 달성" },
        d28: { completed: false, text: "연속 28일 출석 달성" }
      }
    };

    // 기존 achievements가 없으면 기본값 설정
    if (!user.gameData?.achievements?.attendance) {
      updateFields['gameData.achievements'] = defaultAchievements;
    }

    // 연속 출석 일수에 따른 업적 해제 확인
    const achievementKeys = ['d1', 'd7', 'd14', 'd21', 'd28'];
    const achievementDays = [1, 7, 14, 21, 28];
    
    achievementKeys.forEach((key, index) => {
      const requiredDays = achievementDays[index];
      if (newConsecutiveAttendance >= requiredDays) {
        const currentAchievement = user.gameData?.achievements?.attendance?.[key as keyof typeof user.gameData.achievements.attendance];
        // 아직 완료되지 않은 업적만 해제
        if (!currentAchievement?.completed) {
          const achievementText = defaultAchievements.attendance[key as keyof typeof defaultAchievements.attendance].text;
          updateFields[`gameData.achievements.attendance.${key}.completed`] = true;
          unlockedAchievements.push({ key, text: achievementText });
        }
      }
    });

    // 출석체크 및 경험치 업데이트 (gameData 구조)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );

    console.log(`📅 출석체크 완료: ${user.email}, 연속 ${newConsecutiveAttendance}일, ${totalXp}XP 획득`);

    if (leveledUp) {
      console.log(`🎉 레벨업! ${user.gameData?.level || 1} → ${level}`);
    }

    if (unlockedAchievements.length > 0) {
      console.log(`🏆 업적 해제:`, unlockedAchievements.map(a => `${a.key}: ${a.text}`).join(', '));
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
        leveledUp,
        unlockedAchievements
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
 * 일반 사용자도 API 호출 가능
 */
export async function GET(request: NextRequest) {
  try {
    // 세션 확인 (일반 사용자도 접근 가능)
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자 ID입니다.' },
        { status: 400 }
      );
    }

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

    const hasCheckedToday = user.gameData?.lastAttendance === today;

    return NextResponse.json({
      success: true,
      data: {
        lastAttendance: user.gameData?.lastAttendance,
        consecutiveAttendance: user.gameData?.consecutiveAttendance || 0,
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