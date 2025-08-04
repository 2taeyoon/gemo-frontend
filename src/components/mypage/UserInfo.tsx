import React from 'react';

interface UserInfoProps {
  name: string;
  level: number;
  currentXp: number;
}

export default function UserInfo({ name, level, currentXp }: UserInfoProps) {
  return (
    <div className="user-info">
      <div className="user-level">
        <span className="level-text">Lv.{level}</span>
        <span className="xp-text">{currentXp} XP</span>
      </div>
      <div className="user-name">{name}님</div>
    </div>
  );
} 