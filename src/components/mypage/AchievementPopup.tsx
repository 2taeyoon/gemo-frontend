"use client";

import React, { useState, useEffect } from 'react';
import { AttendanceAchievementKey } from '@/types/user';

interface AchievementPopupProps {
  achievements: { key: AttendanceAchievementKey; text: string }[];
  onClose: () => void;
}

// 업적별 이모지 매핑
const getAchievementEmoji = (key: AttendanceAchievementKey): string => {
  switch (key) {
    case 'd1': return '🎉';
    case 'd7': return '🔥';
    case 'd14': return '🏅';
    case 'd21': return '🏆';
    case 'd28': return '👑';
    default: return '🎉';
  }
};

export default function AchievementPopup({ achievements, onClose }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 현재 표시할 업적
  const currentAchievement = achievements[currentIndex];

  // 다음 업적으로 이동하거나 팝업 닫기
  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  // ESC 키로 팝업 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentAchievement) return null;

  return (
    <div className="achievement-popup">
      <div className="achievement-popup-content">
        <div className="achievement-emoji">
          {getAchievementEmoji(currentAchievement.key)}
        </div>
        <h2>업적 해제!</h2>
        <p>{currentAchievement.text}</p>
        <button
          className="achievement-popup-button"
          onClick={handleNext}
        >
          {currentIndex < achievements.length - 1 ? '다음' : '확인'}
        </button>
        {achievements.length > 1 && (
          <div style={{ 
            marginTop: '15px', 
            fontSize: '14px', 
            color: 'var(--muted-foreground)' 
          }}>
            {currentIndex + 1} / {achievements.length}
          </div>
        )}
      </div>
    </div>
  );
}
