"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import UserInfo from "@/components/mypage/UserInfo";
import AttendanceSection from "@/components/mypage/AttendanceSection";
import GameStats from "@/components/mypage/GameStats";
import RewardsSection from "@/components/mypage/RewardsSection";
import LoadingSpinner from "@/components/mypage/LoadingSpinner";
import LoginRequired from "@/components/mypage/LoginRequired";
import ErrorMessage from "@/components/mypage/ErrorMessage";
import HomeLink from "@/components/mypage/HomeLink";

/**
 * 마이페이지 클라이언트 컴포넌트
 * 사용자의 출석체크 기능과 게임 통계를 관리합니다.
 */
export default function Mypage() {
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
      const response = await fetch('/api/user/attendance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
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
    return <LoadingSpinner />;
  }

  // 로그인하지 않은 경우
  if (status === "unauthenticated") {
    return <LoginRequired />;
  }

  // 사용자 정보가 없는 경우
  if (!user || !attendanceStatus) {
    return <ErrorMessage />;
  }

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1 className="mypage-title">📊 마이페이지</h1>
          <p className="mypage-subtitle">게임 통계와 출석체크를 관리하세요!</p>
        </div>

        {/* 현재 사용자 레벨 정보 */}
        <UserInfo user={user} />

        {/* 출석체크 메인 영역 */}
        <AttendanceSection
          attendanceStatus={attendanceStatus}
          isProcessing={isProcessing}
          onCheckAttendance={handleCheckAttendance}
          getBonusXp={getBonusXp}
        />

        {/* 게임 통계 */}
        <GameStats user={user} attendanceStatus={attendanceStatus} />

        {/* 출석 보상 안내 */}
        <RewardsSection
          attendanceStatus={attendanceStatus}
          getDaysToNextReward={getDaysToNextReward}
        />

        {/* 홈으로 돌아가기 */}
        <HomeLink />
      </div>
    </div>
  );
}