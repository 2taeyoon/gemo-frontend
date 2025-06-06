import React from 'react';
import Gemocard from '@/app/gemocard/Gemocard';

export const metadata = {
  title: 'GEMO',
  description: '시간 때울 때 사용하기 좋은 게임 GEMO입니다.',
  keywords: ['GEMO', '게임', '시간 때우기'],
  openGraph: {
    title: 'GEMO',
    description: '시간 때울 때 사용하기 좋은 게임 GEMO입니다.',
    type: 'website',
  },
};

export default function Page() {
  return <Gemocard />;
}
