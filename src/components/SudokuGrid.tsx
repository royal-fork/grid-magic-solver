
import React from 'react';
import { cn } from '@/lib/utils';

interface SudokuGridProps {
  grid: number[][];
  originalGrid: number[][];
  size: number;
  onChange: (row: number, col: number, value: number) => void;
  isAnimating: boolean;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  originalGrid,
  size,
  onChange,
  isAnimating
}) => {
  const getBoxSize = (gridSize: number) => Math.sqrt(gridSize);
  const boxSize = getBoxSize(size);

  const handleInputChange = (row: number, col: number, value: string) => {
    console.log('Input change:', { row, col, value, isAnimating });
    
    // Allow empty string or valid numbers
    if (value === '') {
      onChange(row, col, 0);
      return;
    }
    
    const numValue = parseInt(value);
    
    // Check if it's a valid number within range
    if (!isNaN(numValue) && numValue >= 1 && numValue <= size) {
      onChange(row, col, numValue);
    }
  };

  const getCellClasses = (row: number, col: number, value: number) => {
    const isOriginal = originalGrid[row][col] !== 0;
    const isRightBorder = (col + 1) % boxSize === 0 && col !== size - 1;
    const isBottomBorder = (row + 1) % boxSize === 0 && row !== size - 1;
    
    return cn(
      "w-full h-full text-center font-mono font-semibold transition-all duration-200",
      "border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      {
        // Cell size based on grid size
        "text-lg": size === 4,
        "text-base": size === 9,
        "text-sm": size === 16,
        // Original vs user input styling
        "bg-slate-100 text-slate-700 font-bold": isOriginal,
        "bg-white text-blue-600 hover:bg-blue-50": !isOriginal && value !== 0,
        "bg-white hover:bg-slate-50": !isOriginal && value === 0,
        // Box borders
        "border-r-2 border-r-slate-600": isRightBorder,
        "border-b-2 border-b-slate-600": isBottomBorder,
        // Animation state
        "animate-pulse": isAnimating && !isOriginal && value !== 0,
        // Disabled state - only disable if original cell or animating
        "cursor-not-allowed opacity-75": isOriginal || isAnimating,
      }
    );
  };

  const getCellSize = () => {
    if (size === 4) return "w-16 h-16";
    if (size === 9) return "w-12 h-12";
    return "w-8 h-8";
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={cn(
          "grid gap-0 p-2 bg-slate-600 rounded-lg shadow-xl",
          `grid-cols-${size}`
        )}
        style={{ 
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          maxWidth: size === 16 ? '600px' : 'auto'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isOriginal = originalGrid[rowIndex][colIndex] !== 0;
            
            return (
              <div key={`${rowIndex}-${colIndex}`} className={getCellSize()}>
                <input
                  type="text"
                  value={cell === 0 ? '' : cell.toString()}
                  onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                  className={getCellClasses(rowIndex, colIndex, cell)}
                  disabled={isOriginal || isAnimating}
                  maxLength={size > 9 ? 2 : 1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;
