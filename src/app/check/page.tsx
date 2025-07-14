"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import "../../styles/check.css";

/**
 * 출석체크 페이지 컴포넌트
 * 사용자의 출석체크 기능과 연속 출석 기록을 관리합니다.
 */
export default function CheckPage() {
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
   * 연속 출석에 따른 보너스 경험치 계산
   * @param consecutiveDays - 연속 출석 일수
   * @returns 보너스 경험치
   */
  const getBonusXp = (consecutiveDays: number): number => {
    const baseXp = 50;
    const bonusXp = Math.min(consecutiveDays * 10, 100);
    return baseXp + bonusXp;
  };

  /**
   * 다음 보상까지의 일수 계산
   * @param consecutiveDays - 현재 연속 출석 일수
   * @returns 다음 보상까지 남은 일수
   */
  const getDaysToNextReward = (consecutiveDays: number): number => {
    const rewards = [7, 14, 30, 50, 100];
    for (const reward of rewards) {
      if (consecutiveDays < reward) {
        return reward - consecutiveDays;
      }
    }
    return 0; // 모든 보상 달성
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
      <div className="check-container">
        <div className="check-card">
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
      <div className="check-container">
        <div className="check-card">
          <div className="login-required">
            <h2>로그인이 필요합니다</h2>
            <p>출석체크를 하려면 먼저 로그인해주세요.</p>
            <Link href="/login" className="login-button">
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
      <div className="check-container">
        <div className="check-card">
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
    <div className="check-container">
      <div className="check-card">
        <div className="check-header">
          <h1 className="check-title">📅 출석체크</h1>
          <p className="check-subtitle">매일 출석하고 경험치를 획득하세요!</p>
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
                  <span className="number">{attendanceStatus.consecutiveAttendance}</span>
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
                <p>예상 보상: <strong>{getBonusXp(attendanceStatus.consecutiveAttendance + 1)} XP</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* 출석 통계 */}
        <div className="attendance-stats">
          <div className="stat-item">
            <div className="stat-number">{attendanceStatus.consecutiveAttendance}</div>
            <div className="stat-label">연속 출석</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{user.gameWins}</div>
            <div className="stat-label">게임 승리</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{user.consecutiveWins}</div>
            <div className="stat-label">연속 승리</div>
          </div>
        </div>

        {/* 출석 보상 안내 */}
        <div className="reward-info">
          <h3>🎁 출석 보상</h3>
          <div className="reward-list">
            <div className={`reward-item ${attendanceStatus.consecutiveAttendance >= 1 ? 'achieved' : ''}`}>
              <span className="reward-day">1일</span>
              <span className="reward-desc">기본 50 XP</span>
            </div>
            <div className={`reward-item ${attendanceStatus.consecutiveAttendance >= 7 ? 'achieved' : ''}`}>
              <span className="reward-day">7일</span>
              <span className="reward-desc">120 XP + 보너스</span>
            </div>
            <div className={`reward-item ${attendanceStatus.consecutiveAttendance >= 14 ? 'achieved' : ''}`}>
              <span className="reward-day">14일</span>
              <span className="reward-desc">190 XP + 특별 보너스</span>
            </div>
            <div className={`reward-item ${attendanceStatus.consecutiveAttendance >= 30 ? 'achieved' : ''}`}>
              <span className="reward-day">30일</span>
              <span className="reward-desc">350 XP + 최대 보너스</span>
            </div>
          </div>

          {/* 다음 보상까지의 진행도 */}
          {getDaysToNextReward(attendanceStatus.consecutiveAttendance) > 0 && (
            <div className="next-reward">
              <p>
                다음 보상까지 <strong>{getDaysToNextReward(attendanceStatus.consecutiveAttendance)}일</strong> 남았습니다!
              </p>
            </div>
          )}
        </div>

        {/* 홈으로 돌아가기 */}
        <div className="check-footer">
          <Link href="/" className="home-link">
            🏠 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 