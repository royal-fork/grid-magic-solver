// Sudoku solver utilities with backtracking algorithm

export interface SolveResult {
  solved: boolean;
  grid: number[][];
  steps: number;
}

// Check if placing a number is safe (no conflicts)
export const isSafe = (board: number[][], row: number, col: number, num: number): boolean => {
  const size = board.length;
  const boxSize = Math.sqrt(size);
  
  // Check row
  for (let x = 0; x < size; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column
  for (let x = 0; x < size; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check box
  const startRow = row - (row % boxSize);
  const startCol = col - (col % boxSize);
  
  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }
  
  return true;
};

// Solve sudoku with backtracking (synchronous)
export const solveSudoku = (board: number[][]): SolveResult => {
  const size = board.length;
  let steps = 0;
  
  const solve = (): boolean => {
    steps++;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= size; num++) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              
              if (solve()) return true;
              
              board[row][col] = 0; // backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  const solved = solve();
  return { solved, grid: board, steps };
};

// Animated solver for visual demonstration
export const solveSudokuAnimated = async (
  board: number[][],
  onUpdate: (grid: number[][]) => void,
  delay: number = 50
): Promise<SolveResult> => {
  const size = board.length;
  let steps = 0;
  
  const solve = async (): Promise<boolean> => {
    steps++;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= size; num++) {
            if (isSafe(board, row, col, num)) {
              board[row][col] = num;
              onUpdate(board);
              
              await new Promise(resolve => setTimeout(resolve, delay));
              
              if (await solve()) return true;
              
              board[row][col] = 0; // backtrack
              onUpdate(board);
              await new Promise(resolve => setTimeout(resolve, delay / 2));
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  
  const solved = await solve();
  return { solved, grid: board, steps };
};

// Generate a random solvable puzzle
export const generatePuzzle = (size: number): number[][] => {
  // Create empty grid
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  
  // Fill diagonal boxes first (they don't affect each other)
  const boxSize = Math.sqrt(size);
  for (let i = 0; i < size; i += boxSize) {
    fillBox(grid, i, i, size);
  }
  
  // Solve the grid
  solveSudoku(grid);
  
  // Remove numbers to create puzzle (keep 30-50% filled)
  const cellsToKeep = Math.floor(size * size * (0.3 + Math.random() * 0.2));
  const cellsToRemove = size * size - cellsToKeep;
  
  for (let i = 0; i < cellsToRemove; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * size);
      col = Math.floor(Math.random() * size);
    } while (grid[row][col] === 0);
    
    grid[row][col] = 0;
  }
  
  return grid;
};

// Fill a box with valid numbers
const fillBox = (grid: number[][], row: number, col: number, size: number): void => {
  const boxSize = Math.sqrt(size);
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  
  // Shuffle numbers
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  let numIndex = 0;
  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      grid[row + i][col + j] = numbers[numIndex++];
    }
  }
};

// Validate if current grid state is valid (no conflicts)
export const isValidSudoku = (board: number[][]): boolean => {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== 0) {
        const num = board[row][col];
        board[row][col] = 0; // temporarily remove to check
        
        if (!isSafe(board, row, col, num)) {
          board[row][col] = num; // restore
          return false;
        }
        
        board[row][col] = num; // restore
      }
    }
  }
  
  return true;
};

// Get difficulty rating based on filled cells
export const getDifficulty = (board: number[][]): string => {
  const size = board.length;
  const filledCells = board.flat().filter(cell => cell !== 0).length;
  const percentage = filledCells / (size * size);
  
  if (percentage > 0.6) return 'Easy';
  if (percentage > 0.4) return 'Medium';
  if (percentage > 0.25) return 'Hard';
  return 'Expert';
};
