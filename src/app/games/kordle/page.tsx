'use client';

import React from 'react';
// import { WordleGame } from '@/components/kordle/WordleGame';

export default function WordlePage() {
  // 임시로 고정된 단어 사용 (나중에 API로 대체)
  const initialWord = "사과";

  return (
    <div className="container mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-center my-8">
        한글 자모음 워들
      </h1>
      {/* <WordleGame initialWord={initialWord} /> */}
    </div>
  );
} 