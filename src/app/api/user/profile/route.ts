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
 * 사용자 프로필 조회 API
 * GET /api/user/profile
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
    console.log('🔍 프로필 조회 userId:', userId);
    
    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    const userProfile = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!userProfile) {
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 프로필 조회 성공:', userProfile.email);

    return NextResponse.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('❌ 프로필 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 사용자 프로필 업데이트 API
 * PUT /api/user/profile
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const updateData = await request.json();

    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: '프로필이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('❌ 프로필 업데이트 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 