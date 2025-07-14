import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';

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
    signIn: '/login',
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  callbacks: {
    /**
     * JWT 콜백 - 토큰에 userId 포함
     */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },

    /**
     * 세션 콜백 - 세션에 userId 포함
     */
    async session({ session, token }) {
      if (token?.userId && session.user) {
        (session.user as any).id = token.userId as string;
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
        } else {
          console.log('🆕 신규 사용자 생성:', user.email);
          
          // 신규 사용자 생성 (모든 데이터를 users 컬렉션에)
          const newUser = {
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            // 게임 데이터
            level: 1,
            currentXp: 0,
            totalXp: 0,
            lastAttendance: null,
            consecutiveAttendance: 0,
            gameWins: 0,
            consecutiveWins: 0,
            totalScore: 0,
            kodleTotalPlayed: 0,
            achievements: [],
            lastPlayed: null,
            // 사용자 설정
            thema: 'light' as const,
            notifications: true,
          };

          const result = await usersCollection.insertOne(newUser);
          user.id = result.insertedId.toString();
          
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