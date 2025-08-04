import React from 'react';
import { AttendanceStatus } from '@/types/user';
import { getDaysToNextReward } from '@/utils/attendance';

interface RewardsSectionProps {
  attendanceStatus: AttendanceStatus;
}

export default function RewardsSection({ attendanceStatus }: RewardsSectionProps) {
  const consecutiveDays = attendanceStatus?.consecutiveAttendance || 0;
  const daysToNextReward = getDaysToNextReward(consecutiveDays);

  return (
    <div className="rewards-section">
      <h3>🎁 출석 보상</h3>
      <div className="reward-list">
        <div className={`reward-item ${consecutiveDays >= 1 ? 'achieved' : ''}`}>
          <span className="reward-day">1일</span>
          <span className="reward-desc">기본 50 XP</span>
        </div>
        <div className={`reward-item ${consecutiveDays >= 3 ? 'achieved' : ''}`}>
          <span className="reward-day">3일</span>
          <span className="reward-desc">150 XP (기본 50 + 보너스 100)</span>
        </div>
        <div className={`reward-item ${consecutiveDays >= 7 ? 'achieved' : ''}`}>
          <span className="reward-day">7일</span>
          <span className="reward-desc">250 XP (기본 50 + 보너스 200)</span>
        </div>
        <div className={`reward-item ${consecutiveDays >= 14 ? 'achieved' : ''}`}>
          <span className="reward-day">14일</span>
          <span className="reward-desc">350 XP (기본 50 + 보너스 300)</span>
        </div>
        <div className={`reward-item ${consecutiveDays >= 21 ? 'achieved' : ''}`}>
          <span className="reward-day">21일</span>
          <span className="reward-desc">450 XP (기본 50 + 보너스 400)</span>
        </div>
        <div className={`reward-item ${consecutiveDays >= 30 ? 'achieved' : ''}`}>
          <span className="reward-day">30일</span>
          <span className="reward-desc">550 XP (기본 50 + 보너스 500)</span>
        </div>
      </div>

      {/* 다음 보상까지의 진행도 */}
      {daysToNextReward > 0 && (
        <div className="next-reward">
          <p>
            다음 보너스 보상까지 <strong>{daysToNextReward}일</strong> 남았습니다!
          </p>
        </div>
      )}
    </div>
  );
} 