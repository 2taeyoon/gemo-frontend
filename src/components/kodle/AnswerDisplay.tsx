import React from 'react';

interface AnswerDisplayProps {
  targetWord: string;
  targetJamo: string[];
}

export default function AnswerDisplay({ targetWord, targetJamo }: AnswerDisplayProps) {
  return (
    <div style={{
      backgroundColor: '#ff6b6b',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '18px',
      fontWeight: 'bold'
    }}>
      🎯 테스트용 정답: {targetWord} ({targetJamo.join(" ")})
    </div>
  );
} 