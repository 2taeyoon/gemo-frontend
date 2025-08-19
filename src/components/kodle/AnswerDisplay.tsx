"use client";

interface AnswerDisplayProps {
  targetWord: string;
  gameOver: boolean;
  won: boolean;
}

/**
 * 정답 표시 컴포넌트
 * 게임 종료 시 정답을 표시합니다.
 */
export default function AnswerDisplay({ targetWord, gameOver, won }: AnswerDisplayProps) {
  if (!gameOver) {
    return null;
  }

  return (
    <div className={`answer-display ${won ? 'won' : 'lost'}`}>
      <div className="answer-content">
        <h3>{won ? '🎉 정답!' : '😞 아쉬워요!'}</h3>
        <div className="target-word">
          <span className="word-label">정답:</span>
          <span className="word-value">{targetWord}</span>
        </div>
        {won ? (
          <p className="success-message">축하합니다! 경험치를 획득했습니다!</p>
        ) : (
          <p className="failure-message">다음에는 더 잘할 수 있을 거예요!</p>
        )}
      </div>
    </div>
  );
}
