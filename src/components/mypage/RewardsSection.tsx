"use client";

interface AttendanceStatus {
  consecutiveAttendance: number;
}

interface RewardsSectionProps {
  attendanceStatus: AttendanceStatus;
  getDaysToNextReward: (days: number) => number;
}

/**
 * 출석 보상 안내 컴포넌트
 */
export default function RewardsSection({ attendanceStatus, getDaysToNextReward }: RewardsSectionProps) {
  const rewards = [
    { days: 1, desc: "기본 50 XP" },
    { days: 3, desc: "150 XP (기본 50 + 보너스 100)" },
    { days: 7, desc: "250 XP (기본 50 + 보너스 200)" },
    { days: 14, desc: "350 XP (기본 50 + 보너스 300)" },
    { days: 21, desc: "450 XP (기본 50 + 보너스 400)" },
    { days: 30, desc: "550 XP (기본 50 + 보너스 500)" }
  ];

  return (
    <div className="rewards-section">
      <h3>🎁 출석 보상</h3>
      <div className="reward-list">
        {rewards.map((reward) => (
          <div 
            key={reward.days}
            className={`reward-item ${(attendanceStatus.consecutiveAttendance || 0) >= reward.days ? 'achieved' : ''}`}
          >
            <span className="reward-day">{reward.days}일</span>
            <span className="reward-desc">{reward.desc}</span>
          </div>
        ))}
      </div>

      {/* 다음 보상까지의 진행도 */}
      {getDaysToNextReward(attendanceStatus.consecutiveAttendance || 0) > 0 && (
        <div className="next-reward">
          <p>
            다음 보너스 보상까지 <strong>{getDaysToNextReward(attendanceStatus.consecutiveAttendance || 0)}일</strong> 남았습니다!
          </p>
        </div>
      )}
    </div>
  );
}
