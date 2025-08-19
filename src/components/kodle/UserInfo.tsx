"use client";

import { useUser } from "@/contexts/UserContext";

/**
 * 사용자 정보 컴포넌트
 * 코들 게임에서 사용자의 레벨과 통계를 표시합니다.
 */
export default function UserInfo() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="user-info-card">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="user-info-card">
      <div className="user-stats">
        <div className="user-level">
          <span className="level-label">레벨</span>
          <span className="level-value">{user.level}</span>
        </div>
        <div className="user-xp">
          <span className="xp-label">경험치</span>
          <span className="xp-value">{user.currentXp} XP</span>
        </div>
      </div>
      
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">승리</span>
          <span className="stat-value">{user.kodleGameWins || user.gameWins || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">연승</span>
          <span className="stat-value">{user.kodleSuccessiveVictory || user.consecutiveWins || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">최대연승</span>
          <span className="stat-value">{user.kodleMaximumSuccessiveVictory || 0}</span>
        </div>
      </div>
    </div>
  );
}
