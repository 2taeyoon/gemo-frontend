"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import "@/styles/auth/mypage.css";
import { fetchAttendanceStatus } from "@/utils/attendance";
import { calculateGameStats } from "@/utils/gameStats";
import { AttendanceStatus } from "@/types/user";

// 분리된 컴포넌트들
import LoadingSpinner from "@/components/mypage/LoadingSpinner";
import LoginRequired from "@/components/mypage/LoginRequired";
import ErrorMessage from "@/components/mypage/ErrorMessage";
import UserInfo from "@/components/mypage/UserInfo";
import AttendanceSection from "@/components/mypage/AttendanceSection";
import GameStats from "@/components/mypage/GameStats";
import RewardsSection from "@/components/mypage/RewardsSection";
import HomeLink from "@/components/mypage/HomeLink";

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
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  
  // 출석체크 처리 중 상태
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 상태 로딩 중
  const [statusLoading, setStatusLoading] = useState(true);

  /**
   * 출석체크 상태를 API에서 조회하는 함수
   */
  const fetchAttendanceStatusHandler = async () => {
    if (!session?.user) return;

    try {
      const result = await fetchAttendanceStatus();
      setAttendanceStatus(result);
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
      await fetchAttendanceStatusHandler();
    } catch (error) {
      console.error('출석체크 처리 중 오류:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 세션이나 사용자 상태가 변경될 때 출석체크 상태 조회
   */
  useEffect(() => {
    if (status === 'authenticated' && user) {
      fetchAttendanceStatusHandler();
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

  // 게임 통계 계산
  const gameStats = calculateGameStats(user);

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <div className="mypage-header">
          <h1 className="mypage-title">📊 마이페이지</h1>
          <p className="mypage-subtitle">게임 통계와 출석체크를 관리하세요!</p>
        </div>

        {/* 현재 사용자 레벨 정보 */}
        <UserInfo 
          name={user.name} 
          level={user.level} 
          currentXp={user.currentXp} 
        />

        {/* 출석체크 메인 영역 */}
        <AttendanceSection 
          attendanceStatus={attendanceStatus}
          isProcessing={isProcessing}
          onCheckAttendance={handleCheckAttendance}
        />

        {/* 게임 통계 */}
        <GameStats 
          attendanceStatus={attendanceStatus}
          gameStats={gameStats}
        />

        {/* 출석 보상 안내 */}
        <RewardsSection attendanceStatus={attendanceStatus} />

        {/* 홈으로 돌아가기 */}
        <HomeLink />
      </div>
    </div>
  );
} 