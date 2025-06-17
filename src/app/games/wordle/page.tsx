'use client';

import { useState, useEffect } from 'react';
import WordleGame from '@/components/wordle/WordleGame';

export default function WordlePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">한글 워들</h1>
      <WordleGame />
    </main>
  );
} 