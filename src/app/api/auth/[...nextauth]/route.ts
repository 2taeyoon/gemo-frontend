import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from '@/lib/mongodb';
import { UserService } from '@/lib/user-service';

const handler = NextAuth({
  // 인증 제공자 설정
  providers: [
    // 구글 로그인 제공자
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  
  // MongoDB 어댑터 설정 - 사용자 정보를 MongoDB Atlas에 저장
  adapter: MongoDBAdapter(clientPromise),
  
  // NextAuth 보안 키
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
  
  // 세션 설정 - database 방식 사용 (MongoDB에 저장)
  session: {
    strategy: "database",
  },
  
  // 콜백 함수들
  callbacks: {
    // 세션 콜백 - 세션 객체에 사용자 ID 추가
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = user.id;
        
        // 사용자 통합 프로필 조회해서 세션에 추가
        try {
          const userProfile = await UserService.getUserProfile(user.id);
          if (userProfile) {
            (session.user as any).gameData = userProfile.gameData;
            (session.user as any).preferences = userProfile.preferences;
          }
        } catch (error) {
          console.error('사용자 프로필 조회 중 오류:', error);
        }
      }
      return session;
    },
  },
  
  // 커스텀 페이지 설정
  pages: {
    signIn: '/login', // 로그인 페이지 경로
  },
  
  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',
  
  // 이벤트 핸들러
  events: {
    // 새 사용자가 생성될 때 실행되는 이벤트
    async createUser({ user }) {
      console.log(`✅ 새 사용자가 MongoDB Atlas에 저장되었습니다: ${user.email}`);
      
      // 사용자 통합 프로필 생성
      try {
        await UserService.createUserProfile({
          userId: user.id,
          name: user.name || 'Unknown',
          email: user.email || '',
          image: user.image ?? undefined,
        });
      } catch (error) {
        console.error('사용자 통합 프로필 생성 중 오류:', error);
      }
    },
    
    // 사용자가 로그인할 때 실행되는 이벤트
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`🔐 사용자 로그인: ${user.email}, 제공자: ${account?.provider}`);
      
      // 기존 사용자이고 통합 프로필이 없으면 생성
      if (!isNewUser) {
        try {
          const existingProfile = await UserService.getUserProfile(user.id);
          if (!existingProfile) {
            console.log(`📝 기존 사용자의 통합 프로필을 생성합니다: ${user.email}`);
                         await UserService.createUserProfile({
               userId: user.id,
               name: user.name || 'Unknown',
               email: user.email || '',
               image: user.image ?? undefined,
             });
          }
        } catch (error) {
          console.error('기존 사용자 프로필 확인/생성 중 오류:', error);
        }
      }
    },
  },
});

export { handler as GET, handler as POST }; 