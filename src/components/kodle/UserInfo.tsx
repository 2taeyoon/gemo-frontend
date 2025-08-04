import React from 'react';

interface UserInfoProps {
  user: any;
}

export default function UserInfo({ user }: UserInfoProps) {
  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>
      <p>사용자 이름: {user.name}</p>
      <p>사용자 ID: {user.id}</p>
    </div>
  );
} 