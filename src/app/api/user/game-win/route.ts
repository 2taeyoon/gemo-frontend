import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { checkSuperAdminAuth, createNotFoundRedirect } from '@/utils/adminAuth';

/**
 * 게임 승리 처리 API
 * POST /api/user/game-win
 * ⚠️ 슈퍼 관리자 권한 필요
 * 사용자의 게임 승리를 처리하고 경험치를 지급합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 슈퍼 관리자 권한 검증
    const authResult = await checkSuperAdminAuth();
    
    if (!authResult.isAuthorized) {
      return createNotFoundRedirect();
    }

    const userId = authResult.userId!;
    
    // 🔍 기존 game-win API 디버깅 (슈퍼 관리자)
    console.log('🔍 기존 game-win API 디버깅 (슈퍼 관리자):');
    console.log('  - userId:', userId);
    console.log('  - userId type:', typeof userId);
    
    const client = await clientPromise;
    const db = client.db('gemo');
    const usersCollection = db.collection('users');

    // 현재 사용자 정보 조회 (새로운 구조 적용을 위해)
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    // 🔍 기존 API 사용자 조회 결과 로그
    console.log('  - MongoDB 조회 결과:', user ? '✅ 사용자 발견' : '❌ 사용자 없음');
    
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 게임 통계 가져오기 (새로운 구조 우선, 기존 구조 fallback)
    const currentKodleGameWins = user.gameData?.kodleGameWins || user.gameData?.gameWins || 0;
    const currentKodleSuccessiveVictory = user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0;
    const currentKodleMaximumSuccessiveVictory = user.gameData?.kodleMaximumSuccessiveVictory || 0;

    // 새로운 값들 계산
    const newKodleGameWins = currentKodleGameWins + 1;
    const newKodleSuccessiveVictory = currentKodleSuccessiveVictory + 1;
    const newKodleMaximumSuccessiveVictory = Math.max(newKodleSuccessiveVictory, currentKodleMaximumSuccessiveVictory);

    console.log(`🏆 게임 승리 처리 (하위 호환성 API): ${user.email}`);
    console.log(`  - 총 승리: ${currentKodleGameWins} → ${newKodleGameWins}`);
    console.log(`  - 연속 승리: ${currentKodleSuccessiveVictory} → ${newKodleSuccessiveVictory}`);
    console.log(`  - 최대 연속 승리: ${currentKodleMaximumSuccessiveVictory} → ${newKodleMaximumSuccessiveVictory}`);

    // 게임 승리 처리 (새로운 구조 + 하위 호환성)
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: {
          // 새로운 코들 게임 구조
          'gameData.kodleGameWins': newKodleGameWins,
          'gameData.kodleSuccessiveVictory': newKodleSuccessiveVictory,
          'gameData.kodleMaximumSuccessiveVictory': newKodleMaximumSuccessiveVictory,
          
          // 하위 호환성을 위한 기존 필드들
          'gameData.gameWins': newKodleGameWins,
          'gameData.consecutiveWins': newKodleSuccessiveVictory,
          
          // 마지막 업데이트 시간
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: '게임 승리가 기록되었습니다!',
      data: {
        // 하위 호환성을 위한 기존 필드들
        gameWins: newKodleGameWins,
        consecutiveWins: newKodleSuccessiveVictory,
        // 새로운 필드들
        kodleGameWins: newKodleGameWins,
        kodleSuccessiveVictory: newKodleSuccessiveVictory,
        kodleMaximumSuccessiveVictory: newKodleMaximumSuccessiveVictory,
        // 기타 정보
        level: user.gameData?.level || 1,
        currentXp: user.gameData?.currentXp || 0,
        totalXp: user.gameData?.totalXp || 0,
      }
    });

  } catch (error) {
    console.error('게임 승리 처리 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 게임 승리 정보 조회 API
 * GET /api/user/game-win
 * ⚠️ 슈퍼 관리자 권한 필요
 * 게임 승리와 관련된 통계 정보만 반환합니다 (하위 호환성 API).
 */
export async function GET(request: NextRequest) {
  try {
    // 슈퍼 관리자 권한 검증
    const authResult = await checkSuperAdminAuth();
    
    if (!authResult.isAuthorized) {
      return createNotFoundRedirect();
    }

    const userId = authResult.userId!;
    const user = authResult.user!;
    
    console.log('🔍 [GET game-win] 게임 승리 정보 조회 (슈퍼 관리자):');
    console.log('  - userId:', userId);

    console.log('✅ 게임 승리 정보 조회 성공:', user.email);

    // 게임 승리 관련 데이터만 반환 (하위 호환성 포함)
    return NextResponse.json({
      success: true,
      data: {
        // 하위 호환성을 위한 기존 필드들
        gameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
        consecutiveWins: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        // 새로운 코들 게임 필드들
        kodleGameWins: user.gameData?.kodleGameWins || user.gameData?.gameWins || 0,
        kodleGameDefeat: user.gameData?.kodleGameDefeat || 0,
        kodleSuccessiveVictory: user.gameData?.kodleSuccessiveVictory || user.gameData?.consecutiveWins || 0,
        kodleMaximumSuccessiveVictory: user.gameData?.kodleMaximumSuccessiveVictory || 0,
        // 레벨 및 경험치 정보 (게임 승리와 관련)
        level: user.gameData?.level || 1,
        currentXp: user.gameData?.currentXp || 0,
        totalXp: user.gameData?.totalXp || 0,
      }
    });

  } catch (error) {
    console.error('❌ 게임 승리 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 