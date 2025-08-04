import React from 'react';
import { getCellClass } from '@/utils/kodleGame';

interface GameGridProps {
  grid: string[][];
  cellStates: ("correct" | "present" | "absent" | "")[][];
  targetJamoLength: number;
}

export default function GameGrid({ grid, cellStates, targetJamoLength }: GameGridProps) {
  return (
    <div
      className="game_grid"
      style={{
        gridTemplateColumns: `repeat(${targetJamoLength}, 1fr)`,
      }}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={getCellClass(
              cellStates[rowIndex][colIndex],
              cell !== "",
            )}>
            {cell}
          </div>
        )),
      )}
    </div>
  );
} 