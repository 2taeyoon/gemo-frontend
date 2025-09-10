import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';
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
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID || "",
      clientSecret: process.env.NAVER_CLIENT_SECRET || "",
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
     * 사용자 로그인 시 users 컬렉션에 저장 (Google, Naver 모두 지원)
     */
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 로그인 시도:', user.email, '제공자:', account?.provider);
        
        const client = await clientPromise;
        const db = client.db('gemo'); // 명시적으로 gemo 데이터베이스 사용
        const usersCollection = db.collection('users');

        // 기존 사용자 확인
        const existingUser = await usersCollection.findOne({ email: user.email });

        if (existingUser) {
          console.log('✅ 기존 사용자 로그인:', user.email);
          user.id = existingUser._id.toString();
          
          // 로그인 제공자 정보 업데이트 (Google ID, Naver ID 등)
          const updateData: any = {
            updatedAt: new Date(),
          };
          
          if (account?.provider === 'google') {
            updateData.googleId = account.providerAccountId;
          } else if (account?.provider === 'naver') {
            updateData.naverId = account.providerAccountId;
          }
          
          await usersCollection.updateOne(
            { _id: existingUser._id },
            { $set: updateData }
          );
        } else {
          console.log('🆕 신규 사용자 생성:', user.email);
          
          // 신규 사용자 생성 (모든 데이터를 users 컬렉션에)
          const newUser: any = {
            name: user.name,
            email: user.email,
            image: user.image,
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
              achievements: {
                attendance: {
                  d1: { completed: false, text: "첫 출석 완료! 연속 1일 달성" },
                  d7: { completed: false, text: "연속 7일 출석 달성" },
                  d14: { completed: false, text: "연속 14일 출석 달성" },
                  d21: { completed: false, text: "연속 21일 출석 달성" },
                  d28: { completed: false, text: "연속 28일 출석 달성" }
                }
              }, // 업적 목록
              lastPlayed: null, // 마지막 플레이 날짜
            },
            // 사용자 설정
            thema: 'light' as const,
            notifications: true,
          };
          
          // 로그인 제공자별 ID 저장
          if (account?.provider === 'google') {
            newUser.googleId = account.providerAccountId;
          } else if (account?.provider === 'naver') {
            newUser.naverId = account.providerAccountId;
          }

          const result = await usersCollection.insertOne(newUser);
          user.id = result.insertedId.toString();
          
          console.log('✅ 신규 사용자 생성 완료:', user.email, 'ID:', user.id, '제공자:', account?.provider);
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