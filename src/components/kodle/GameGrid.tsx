"use client";

interface GameGridProps {
  grid: string[][];
  result: string[][];
  currentRow: number;
  currentCol: number;
  targetJamo: string[];
}

/**
 * 게임 그리드 컴포넌트
 * 사용자의 입력과 결과를 시각적으로 표시합니다.
 */
export default function GameGrid({ grid, result, currentRow, currentCol, targetJamo }: GameGridProps) {
  const getCellClass = (rowIndex: number, colIndex: number): string => {
    let className = "cell";
    
    // 현재 입력 중인 셀 하이라이트
    if (rowIndex === currentRow && colIndex === currentCol) {
      className += " current";
    }
    
    // 결과에 따른 스타일 적용
    if (result[rowIndex] && result[rowIndex][colIndex]) {
      className += ` ${result[rowIndex][colIndex]}`;
    }
    
    return className;
  };

  return (
    <div className="game-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-row">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
