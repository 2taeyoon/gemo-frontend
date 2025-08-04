import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { invalidateAdminCache } from '@/lib/adminAuth';

/**
 * NextAuth 설정
 * MongoDBAdapter 없이 users 컬렉션 하나에 모든 사용자 정보를 통합하여 저장합니다.
 */
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  
  session: {
    strategy: "jwt",
  },
  
  pages: {
    signIn: '/auth',
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  callbacks: {
    /**
     * JWT 콜백 - 토큰에 userId와 superAdmin 포함
     */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.superAdmin = (user as any).superAdmin || false;
      }
      return token;
    },

    /**
     * 세션 콜백 - 세션에 userId와 superAdmin 포함
     */
    async session({ session, token }) {
      if (token?.userId && session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).superAdmin = token.superAdmin as boolean;
      }
      return session;
    },

    /**
     * 사용자 로그인 시 users 컬렉션에 저장
     */
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 로그인 시도:', user.email);
        
        const client = await clientPromise;
        const db = client.db('gemo'); // 명시적으로 gemo 데이터베이스 사용
        const usersCollection = db.collection('users');

        // 기존 사용자 확인
        const existingUser = await usersCollection.findOne({ email: user.email });

        if (existingUser) {
          console.log('✅ 기존 사용자 로그인:', user.email);
          user.id = existingUser._id.toString();
          // 기존 사용자의 superAdmin 상태를 세션에 포함
          (user as any).superAdmin = existingUser.superAdmin || false;
          
          // 관리자 권한이 변경되었을 수 있으므로 캐시 무효화
          invalidateAdminCache(user.id);
        } else {
          console.log('🆕 신규 사용자 생성:', user.email);
          
          // 신규 사용자 생성 (모든 데이터를 users 컬렉션에)
          const newUser = {
            name: user.name,
            email: user.email,
            image: user.image,
            superAdmin: false,
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            // 게임 데이터를 gameData 객체로 구조화
            gameData: {
              level: 1, // 사용자 레벨
              currentXp: 0, // 현재 레벨에서의 경험치
              totalXp: 0, // 총 누적 경험치
              lastAttendance: null, // 마지막 출석 날짜
              consecutiveAttendance: 0, // 연속 출석 일수
              // 코들 게임 관련 통계
              kodleGameWins: 0, // 코들 게임 승리 횟수 (기존 gameWins 대체)
              kodleGameDefeat: 0, // 코들 게임 패배 횟수 (새로 추가)
              kodleSuccessiveVictory: 0, // 코들 게임 연속 승리 횟수 (기존 consecutiveWins 대체)
              kodleMaximumSuccessiveVictory: 0, // 코들 게임 최대 연속 승리 기록 (새로 추가)
              // 기타 게임 데이터
              totalScore: 0, // 총 점수
              kodleTotalPlayed: 0, // 코들 게임 총 플레이 횟수
              achievements: [], // 업적 목록
              lastPlayed: null, // 마지막 플레이 날짜
            },
            // 사용자 설정
            thema: 'light' as const,
            notifications: true,
          };

          const result = await usersCollection.insertOne(newUser);
          user.id = result.insertedId.toString();
          // 신규 사용자의 superAdmin 상태를 세션에 포함 (기본값 false)
          (user as any).superAdmin = false;
          
          console.log('✅ 신규 사용자 생성 완료:', user.email, 'ID:', user.id);
        }

        return true;
      } catch (error) {
        console.error('❌ signIn 콜백 오류:', error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST }; 