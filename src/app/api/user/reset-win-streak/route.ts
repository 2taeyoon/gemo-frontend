import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

/**
 * 연승 초기화 API
 * POST /api/user/reset-win-streak
 * 사용자의 연승 기록을 초기화합니다.
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
    
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    // 연승 초기화
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { 'gameData.consecutiveWins': 0 } }
    );

    // 업데이트된 사용자 프로필 조회
    const updatedProfile = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { 'gameData.gameWins': 1, 'gameData.consecutiveWins': 1 } }
    );

    return NextResponse.json({
      success: true,
      message: '연승이 초기화되었습니다.',
      data: {
        gameWins: updatedProfile?.gameData.gameWins,
        consecutiveWins: updatedProfile?.gameData.consecutiveWins,
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