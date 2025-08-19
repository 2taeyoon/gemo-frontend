"use client";

interface User {
  kodleGameWins?: number;
  gameWins?: number;
  kodleGameDefeat?: number;
  kodleSuccessiveVictory?: number;
  consecutiveWins?: number;
  kodleMaximumSuccessiveVictory?: number;
}

interface AttendanceStatus {
  consecutiveAttendance: number;
}

interface GameStatsProps {
  user: User;
  attendanceStatus: AttendanceStatus;
}

/**
 * 게임 통계 컴포넌트
 */
export default function GameStats({ user, attendanceStatus }: GameStatsProps) {
  // 승률 계산 함수
  const calculateWinRate = (): string => {
    const wins = user.kodleGameWins || user.gameWins || 0;
    const defeats = user.kodleGameDefeat || 0;
    const totalGames = wins + defeats;
    if (totalGames === 0) return '0.0';
    return ((wins / totalGames) * 100).toFixed(1);
  };

  return (
    <div className="stats-section">
      <h3>🎮 게임 통계</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{attendanceStatus.consecutiveAttendance || 0}</div>
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
          <div className="stat-number">{calculateWinRate()}%</div>
          <div className="stat-label">코들 게임 승률</div>
        </div>
      </div>
    </div>
  );
}
