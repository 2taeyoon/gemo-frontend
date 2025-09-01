import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
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
 * 사용자 프로필 조회 API
 * GET /api/user/profile
 * ⚠️ 슈퍼 관리자 권한 필요
 */
export async function GET(request: NextRequest) {
  try {
    // 슈퍼 관리자 권한 검증
    const authResult = await checkSuperAdminAuth();
    
    if (!authResult.isAuthorized) {
      return createNotFoundRedirect();
    }

    const userId = authResult.userId!;
    const userProfile = authResult.user!;
    
    console.log('🔍 프로필 조회 (슈퍼 관리자) userId:', userId);

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
 * 사용자 프로필 조회 API (API 호출용)
 * POST /api/user/profile
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
    
    // MongoDB에서 사용자 정보 조회
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

    console.log(`🔍 사용자 프로필 조회 (API 호출): ${user.email}`);

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ 사용자 프로필 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 사용자 프로필 업데이트 API
 * PUT /api/user/profile
 * 일반 사용자도 API 호출 가능 (제한된 필드만 업데이트 가능)
 */
export async function PUT(request: NextRequest) {
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
    
    const updateData = await request.json();

    // 보안상 업데이트 가능한 필드만 허용
    const allowedFields = ['name', 'thema'];
    const filteredUpdateData: any = {};
    
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      return NextResponse.json(
        { error: '업데이트할 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // MongoDB 직접 접근
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...filteredUpdateData,
          updatedAt: new Date(),
        }
      }
    );

    console.log(`🎨 사용자 프로필 업데이트: ${session.user.email}`, filteredUpdateData);

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