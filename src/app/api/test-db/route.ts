import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * MongoDB 연결 테스트 API
 * GET /api/test-db
 * MongoDB 연결 상태와 컬렉션을 확인합니다.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 MongoDB 연결 테스트 시작...');
    
    // MongoDB 클라이언트 연결 시도
    const client = await clientPromise;
    console.log('✅ MongoDB 클라이언트 연결 성공');
    
    // 데이터베이스 선택
    const db = client.db('gemo');
    console.log('✅ gemo 데이터베이스 선택 성공');
    
    // 컬렉션 목록 조회
    const collections = await db.listCollections().toArray();
    console.log('📋 컬렉션 목록:', collections.map(c => c.name));
    
    // users 컬렉션 확인 (NextAuth가 생성)
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 users 컬렉션 문서 개수: ${userCount}`);
    
    // userProfiles 컬렉션 확인 (우리가 생성)
    const userProfilesCollection = db.collection('userProfiles');
    const profileCount = await userProfilesCollection.countDocuments();
    console.log(`🎮 userProfiles 컬렉션 문서 개수: ${profileCount}`);
    
    // 최근 users 문서 몇 개 조회
    const recentUsers = await usersCollection.find({}).limit(3).toArray();
    console.log('👤 최근 사용자들:', recentUsers);
    
    // 최근 userProfiles 문서 몇 개 조회
    const recentProfiles = await userProfilesCollection.find({}).limit(3).toArray();
    console.log('🎮 최근 프로필들:', recentProfiles);
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB 연결 성공!',
      data: {
        collections: collections.map(c => c.name),
        userCount,
        profileCount,
        recentUsers: recentUsers.map(u => ({ 
          id: u._id, 
          email: u.email, 
          name: u.name,
          createdAt: u.emailVerified 
        })),
        recentProfiles: recentProfiles.map(p => ({
          userId: p.userId,
          level: p.gameData?.level,
          email: p.profile?.email
        }))
      }
    });

  } catch (error) {
    console.error('❌ MongoDB 연결 테스트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: 'MongoDB 연결 실패',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 