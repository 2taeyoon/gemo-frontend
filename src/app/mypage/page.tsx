"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import "../../styles/mypage.css";

/**
 * 마이페이지 컴포넌트
 * 사용자의 출석체크 기능과 게임 통계를 관리합니다.
 */
export default function MyPage() {
  // NextAuth 세션 정보
  const { data: session, status } = useSession();
  
  // 사용자 정보와 출석체크 함수
  const { user, loading, checkAttendance } = useUser();
  
  // 출석체크 상태 관리
  const [attendanceStatus, setAttendanceStatus] = useState<{
    hasCheckedToday: boolean;
    lastAttendance: string | null;
    consecutiveAttendance: number;
  } | null>(null);
  
  // 출석체크 처리 중 상태
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 상태 로딩 중
  const [statusLoading, setStatusLoading] = useState(true);

  /**
   * 출석체크 상태를 API에서 조회하는 함수
   */
  const fetchAttendanceStatus = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/user/attendance');
      const result = await response.json();

      if (result.success) {
        setAttendanceStatus(result.data);
      } else {
        console.error('출석체크 상태 조회 실패:', result.error);
      }
    } catch (error) {
      console.error('출석체크 상태 조회 중 오류:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  /**
   * 출석체크 버튼 클릭 핸들러
   */
  const handleCheckAttendance = async () => {
    if (isProcessing || !user || attendanceStatus?.hasCheckedToday) return;

    setIsProcessing(true);
    
    try {
      // UserContext의 출석체크 함수 호출
      await checkAttendance();
      
      // 출석체크 상태 다시 조회
      await fetchAttendanceStatus();
    } catch (error) {
      console.error('출석체크 처리 중 오류:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 연속 출석에 따른 총 경험치 계산 (기본 50XP + 보너스 XP)
   * 새로운 보상 체계에 따라 특정 연속 출석 일수마다 보너스 지급
   * @param consecutiveDays - 연속 출석 일수
   * @returns 총 획득 경험치 (기본 + 보너스)
   */
  const getBonusXp = (consecutiveDays: number): number => {
    const baseXp = 50; // 기본 경험치
    let bonusXp = 0; // 보너스 경험치 초기화
    
    // 연속 출석 일수에 따른 보너스 XP 계산
    if (consecutiveDays >= 30) {
      bonusXp = 500; // 30일 연속: 500XP 보너스
    } else if (consecutiveDays >= 21) {
      bonusXp = 400; // 21일 연속: 400XP 보너스
    } else if (consecutiveDays >= 14) {
      bonusXp = 300; // 14일 연속: 300XP 보너스
    } else if (consecutiveDays >= 7) {
      bonusXp = 200; // 7일 연속: 200XP 보너스
    } else if (consecutiveDays >= 3) {
      bonusXp = 100; // 3일 연속: 100XP 보너스
    } else {
      bonusXp = 0; // 1~2일: 보너스 없음, 기본 50XP만
    }
    
    return baseXp + bonusXp; // 총 경험치 반환
  };

  /**
   * 다음 보상까지의 일수 계산
   * 새로운 보상 체계의 마일스톤에 따라 계산
   * @param consecutiveDays - 현재 연속 출석 일수
   * @returns 다음 보상까지 남은 일수 (모든 보상 달성 시 0)
   */
  const getDaysToNextReward = (consecutiveDays: number): number => {
    // 새로운 보상 마일스톤: 3일, 7일, 14일, 21일, 30일
    const rewards = [3, 7, 14, 21, 30];
    
    for (const reward of rewards) {
      if (consecutiveDays < reward) {
        return reward - consecutiveDays;
      }
    }
    
    return 0; // 모든 보상 달성 (30일 이상)
  };

  /**
   * 세션이나 사용자 상태가 변경될 때 출석체크 상태 조회
   */
  useEffect(() => {
    if (status === 'authenticated' && user) {
      fetchAttendanceStatus();
    }
  }, [status, user]);

  // 로딩 상태 표시
  if (status === "loading" || loading || statusLoading) {
    return (
      <div className="mypage-container">
        <div className="mypage-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (status === "unauthenticated") {
    return (
      <div className="mypage-container">
        <div className="mypage-card">
          <div className="login-required">
            <h2>로그인이 필요합니다</h2>
            <p>마이페이지를 보려면 먼저 로그인해주세요.</p>
            <Link href="/auth" className="login-button">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없는 경우
  if (!user || !attendanceStatus) {
    return (
      <div className="mypage-container">
        <div className="mypage-card">
          <div className="error-message">
            <h2>오류가 발생했습니다</h2>
            <p>사용자 정보를 불러올 수 없습니다.</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1 className="mypage-title">📊 마이페이지</h1>
          <p className="mypage-subtitle">게임 통계와 출석체크를 관리하세요!</p>
        </div>

        {/* 현재 사용자 레벨 정보 */}
        <div className="user-info">
          <div className="user-level">
            <span className="level-text">Lv.{user.level}</span>
            <span className="xp-text">{user.currentXp} XP</span>
          </div>
          <div className="user-name">{user.name}님</div>
        </div>

        {/* 출석체크 메인 영역 */}
        <div className="attendance-main">
          {attendanceStatus.hasCheckedToday ? (
            // 이미 출석체크한 경우
            <div className="attendance-completed">
              <div className="check-icon">✅</div>
              <h2>오늘 출석체크 완료!</h2>
              <p>내일 다시 출석체크할 수 있습니다.</p>
              <div className="completed-info">
                <div className="consecutive-days">
                  <span className="number">{attendanceStatus?.consecutiveAttendance || 0}</span>
                  <span className="label">연속 출석</span>
                </div>
              </div>
            </div>
          ) : (
            // 아직 출석체크하지 않은 경우
            <div className="attendance-pending">
              <div className="check-icon-pending">📋</div>
              <h2>오늘의 출석체크</h2>
              <p>출석체크하고 경험치를 받아보세요!</p>
              
              <button 
                onClick={handleCheckAttendance}
                disabled={isProcessing}
                className={`check-button ${isProcessing ? 'processing' : ''}`}
              >
                {isProcessing ? '처리 중...' : '출석체크하기'}
              </button>

              <div className="expected-reward">
                <p>예상 보상: <strong>{getBonusXp((attendanceStatus?.consecutiveAttendance || 0) + 1)} XP</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* 게임 통계 */}
        <div className="stats-section">
          <h3>🎮 게임 통계</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{attendanceStatus?.consecutiveAttendance || 0}</div>
              <div className="stat-label">연속 출석</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.kodleGameWins || user.gameWins || 0}</div>
              <div className="stat-label">코들 게임 승리</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.kodleGameDefeat || 0}</div>
              <div className="stat-label">코들 게임 패배</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.kodleSuccessiveVictory || user.consecutiveWins || 0}</div>
              <div className="stat-label">코들 게임 연속 승리</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{user.kodleMaximumSuccessiveVictory || 0}</div>
              <div className="stat-label">코들 게임 최대 연속 승리</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {/* 승률 계산: (승리 / (승리 + 패배)) * 100, 소수점 1자리까지 표시 */}
                {(() => {
                  const wins = user.kodleGameWins || user.gameWins || 0;
                  const defeats = user.kodleGameDefeat || 0;
                  const totalGames = wins + defeats;
                  if (totalGames === 0) return '0.0';
                  return ((wins / totalGames) * 100).toFixed(1);
                })()}%
              </div>
              <div className="stat-label">코들 게임 승률</div>
            </div>
          </div>
        </div>

        {/* 출석 보상 안내 */}
        <div className="rewards-section">
          <h3>🎁 출석 보상</h3>
          <div className="reward-list">
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 1 ? 'achieved' : ''}`}>
              <span className="reward-day">1일</span>
              <span className="reward-desc">기본 50 XP</span>
            </div>
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 3 ? 'achieved' : ''}`}>
              <span className="reward-day">3일</span>
              <span className="reward-desc">150 XP (기본 50 + 보너스 100)</span>
            </div>
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 7 ? 'achieved' : ''}`}>
              <span className="reward-day">7일</span>
              <span className="reward-desc">250 XP (기본 50 + 보너스 200)</span>
            </div>
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 14 ? 'achieved' : ''}`}>
              <span className="reward-day">14일</span>
              <span className="reward-desc">350 XP (기본 50 + 보너스 300)</span>
            </div>
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 21 ? 'achieved' : ''}`}>
              <span className="reward-day">21일</span>
              <span className="reward-desc">450 XP (기본 50 + 보너스 400)</span>
            </div>
            <div className={`reward-item ${(attendanceStatus?.consecutiveAttendance || 0) >= 30 ? 'achieved' : ''}`}>
              <span className="reward-day">30일</span>
              <span className="reward-desc">550 XP (기본 50 + 보너스 500)</span>
            </div>
          </div>

          {/* 다음 보상까지의 진행도 */}
          {getDaysToNextReward(attendanceStatus?.consecutiveAttendance || 0) > 0 && (
            <div className="next-reward">
              <p>
                다음 보너스 보상까지 <strong>{getDaysToNextReward(attendanceStatus?.consecutiveAttendance || 0)}일</strong> 남았습니다!
              </p>
            </div>
          )}
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="mypage-footer">
          <Link href="/" className="home-link">
            🏠 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 