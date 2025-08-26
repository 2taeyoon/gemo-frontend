/**
 * 슈퍼 관리자 권한 검증 유틸리티
 */

import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// NextAuth 설정 (메인 설정과 동일)
export const authOptions = {
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
 * 슈퍼 관리자 권한 검증 함수
 * @returns Promise<{ isAuthorized: boolean, userId?: string, user?: any }>
 */
export async function checkSuperAdminAuth() {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { isAuthorized: false };
    }

    const userId = (session.user as any).id;
    
    if (!userId) {
      return { isAuthorized: false };
    }
    
    // MongoDB에서 사용자 정보 조회
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');
    
    // ObjectId 유효성 검사
    if (!ObjectId.isValid(userId)) {
      return { isAuthorized: false };
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return { isAuthorized: false };
    }

    // superAdmin 필드 확인 (기본값은 false)
    const isSuperAdmin = user.superAdmin === true;
    
    console.log(`🔒 슈퍼 관리자 권한 검증: ${user.email} - ${isSuperAdmin ? '✅ 권한 있음' : '❌ 권한 없음'}`);
    
    return {
      isAuthorized: isSuperAdmin,
      userId: userId,
      user: user
    };
    
  } catch (error) {
    console.error('❌ 슈퍼 관리자 권한 검증 오류:', error);
    return { isAuthorized: false };
  }
}

/**
 * 권한이 없을 때 not-found 페이지로 리디렉션하는 HTML 응답 생성
 * API 라우트에서 브라우저가 not-found.tsx 페이지를 렌더링하도록 리디렉션
 */
export function createNotFoundRedirect() {
  // JavaScript로 즉시 리디렉션하는 HTML 페이지
  const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>페이지를 찾을 수 없습니다</title>
  <script>
    // 즉시 not-found 페이지로 리디렉션
    window.location.replace('/not-found');
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/not-found">
  </noscript>
</head>
<body>
  <p>페이지를 찾을 수 없습니다. 잠시 후 이동됩니다...</p>
  <p>자동으로 이동되지 않으면 <a href="/not-found">여기를 클릭하세요</a>.</p>
</body>
</html>
  `;
  
  return new NextResponse(redirectHtml, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}