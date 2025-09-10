"use client";

import React from 'react';
import { AttendanceAchievementKey, GameDataAchievements } from '@/types/user';

interface AchievementsSectionProps {
  achievements?: GameDataAchievements;
}

// 업적 아이콘 컴포넌트
function AchievementItem({ 
  completed, 
  label, 
  text 
}: { 
  completed: boolean; 
  label: string; 
  text: string; 
}) {
  return (
    <div 
      className={`achievement-icon${completed ? ' completed' : ''}`} 
      title={text} 
      aria-label={text}
    >
      <img 
        src={`/icons/attendance-${label}.svg`} 
        alt={`${label} 업적`} 
        style={{
          width: '36px',
          height: '36px',
          margin: '0 auto 6px',
          opacity: completed ? 1 : 0.65
        }}
      />
      <span className="label">{label}일</span>
    </div>
  );
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  // 업적 아이템 정의
  const items = [
    { key: 'd1' as AttendanceAchievementKey, label: '1' },
    { key: 'd7' as AttendanceAchievementKey, label: '7' },
    { key: 'd14' as AttendanceAchievementKey, label: '14' },
    { key: 'd21' as AttendanceAchievementKey, label: '21' },
    { key: 'd28' as AttendanceAchievementKey, label: '28' },
  ] as const;

  // 기본값 설정 (achievements가 없는 경우)
  const defaultAchievements = {
    attendance: {
      d1: { completed: false, text: "첫 출석 완료! 연속 1일 달성" },
      d7: { completed: false, text: "연속 7일 출석 달성" },
      d14: { completed: false, text: "연속 14일 출석 달성" },
      d21: { completed: false, text: "연속 21일 출석 달성" },
      d28: { completed: false, text: "연속 28일 출석 달성" }
    }
  };

  const attendanceAchievements = achievements?.attendance || defaultAchievements.attendance;

  return (
    <div className="achievements-section">
      <h3>출석 업적</h3>
      <div className="achievement-grid">
        {items.map(({ key, label }) => {
          const achievement = attendanceAchievements[key];
          return (
            <AchievementItem
              key={key}
              completed={achievement?.completed || false}
              label={label}
              text={achievement?.text || defaultAchievements.attendance[key].text}
            />
          );
        })}
      </div>
    </div>
  );
}
