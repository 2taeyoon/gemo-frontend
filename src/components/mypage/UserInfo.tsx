"use client";

interface User {
  level: number;
  currentXp: number;
  name: string;
}

interface UserInfoProps {
  user: User;
}

/**
 * 사용자 정보 표시 컴포넌트
 */
export default function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="user-info">
      <div className="user-level">
        <span className="level-text">Lv.{user.level}</span>
        <span className="xp-text">{user.currentXp} XP</span>
      </div>
      <div className="user-name">{user.name}님</div>
    </div>
  );
}
