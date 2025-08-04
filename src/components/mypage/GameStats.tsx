import React from 'react';
import { AttendanceStatus } from '@/types/user';

interface GameStatsProps {
  attendanceStatus: AttendanceStatus;
  gameStats: {
    wins: number;
    defeats: number;
    consecutiveWins: number;
    maxConsecutiveWins: number;
    winRate: string;
  };
}

export default function GameStats({ attendanceStatus, gameStats }: GameStatsProps) {
  return (
    <div className="stats-section">
      <h3>🎮 게임 통계</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">{attendanceStatus?.consecutiveAttendance || 0}</div>
          <div className="stat-label">연속 출석</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{gameStats.wins}</div>
          <div className="stat-label">코들 게임 승리</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{gameStats.defeats}</div>
          <div className="stat-label">코들 게임 패배</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{gameStats.consecutiveWins}</div>
          <div className="stat-label">코들 게임 연속 승리</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{gameStats.maxConsecutiveWins}</div>
          <div className="stat-label">코들 게임 최대 연속 승리</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{gameStats.winRate}%</div>
          <div className="stat-label">코들 게임 승률</div>
        </div>
      </div>
    </div>
  );
} 