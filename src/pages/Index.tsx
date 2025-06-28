
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SudokuGrid from '@/components/SudokuGrid';
import { solveSudokuAnimated, generatePuzzle, isValidSudoku } from '@/utils/sudokuSolver';
import { Play, RotateCcw, Shuffle, Pause } from 'lucide-react';

const Index = () => {
  const [gridSize, setGridSize] = useState(9);
  const [grid, setGrid] = useState(() => Array(9).fill(null).map(() => Array(9).fill(0)));
  const [originalGrid, setOriginalGrid] = useState(() => Array(9).fill(null).map(() => Array(9).fill(0)));
  const [isAnimating, setIsAnimating] = useState(false);
  const [solveStatus, setSolveStatus] = useState('');
  const [solveTime, setSolveTime] = useState(0);

  const handleGridSizeChange = useCallback((size: string) => {
    const newSize = parseInt(size);
    setGridSize(newSize);
    const newGrid = Array(newSize).fill(null).map(() => Array(newSize).fill(0));
    setGrid(newGrid);
    setOriginalGrid(newGrid);
    setSolveStatus('');
    setSolveTime(0);
  }, []);

  const handleCellChange = useCallback((row: number, col: number, value: number) => {
    if (isAnimating) return;
    
    const newGrid = grid.map((r, i) => 
      r.map((c, j) => (i === row && j === col) ? value : c)
    );
    setGrid(newGrid);
  }, [grid, isAnimating]);

  const handleGeneratePuzzle = useCallback(() => {
    if (isAnimating) return;
    
    setSolveStatus('Generating puzzle...');
    setTimeout(() => {
      const puzzle = generatePuzzle(gridSize);
      setGrid(puzzle);
      setOriginalGrid(puzzle.map(row => [...row]));
      setSolveStatus('Puzzle generated!');
      setTimeout(() => setSolveStatus(''), 2000);
    }, 100);
  }, [gridSize, isAnimating]);

  const handleClearGrid = useCallback(() => {
    if (isAnimating) return;
    
    const emptyGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    setGrid(emptyGrid);
    setOriginalGrid(emptyGrid);
    setSolveStatus('');
    setSolveTime(0);
  }, [gridSize, isAnimating]);

  const handleSolve = useCallback(async () => {
    if (isAnimating) return;
    
    if (!isValidSudoku(grid)) {
      setSolveStatus('Invalid puzzle - please check for conflicts');
      setTimeout(() => setSolveStatus(''), 3000);
      return;
    }

    setIsAnimating(true);
    setSolveStatus('Solving...');
    const startTime = Date.now();

    try {
      const result = await solveSudokuAnimated(
        grid.map(row => [...row]), 
        (newGrid) => setGrid(newGrid.map(row => [...row]))
      );
      
      const endTime = Date.now();
      setSolveTime(endTime - startTime);
      
      if (result.solved) {
        setGrid(result.grid);
        setSolveStatus('Solved!');
      } else {
        setSolveStatus('No solution exists');
      }
    } catch (error) {
      setSolveStatus('Error solving puzzle');
    } finally {
      setIsAnimating(false);
      setTimeout(() => setSolveStatus(''), 3000);
    }
  }, [grid, isAnimating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Sudoku Solver
          </h1>
          <p className="text-slate-600 text-lg">
            Watch the backtracking algorithm solve puzzles in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Grid Size
                </label>
                <Select value={gridSize.toString()} onValueChange={handleGridSizeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4×4 (Easy)</SelectItem>
                    <SelectItem value="9">9×9 (Classic)</SelectItem>
                    <SelectItem value="16">16×16 (Expert)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleGeneratePuzzle} 
                  disabled={isAnimating}
                  className="w-full"
                  variant="default"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate Puzzle
                </Button>
                
                <Button 
                  onClick={handleSolve} 
                  disabled={isAnimating}
                  className="w-full"
                  variant="default"
                >
                  {isAnimating ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isAnimating ? 'Solving...' : 'Solve'}
                </Button>
                
                <Button 
                  onClick={handleClearGrid} 
                  disabled={isAnimating}
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Grid
                </Button>
              </div>

              {solveStatus && (
                <div className="mt-4">
                  <Badge 
                    variant={solveStatus.includes('Solved') ? 'default' : 
                            solveStatus.includes('Error') || solveStatus.includes('Invalid') ? 'destructive' : 
                            'secondary'}
                    className="w-full justify-center py-2"
                  >
                    {solveStatus}
                  </Badge>
                </div>
              )}

              {solveTime > 0 && (
                <div className="text-center text-sm text-slate-600">
                  <p>Solved in {solveTime}ms</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sudoku Grid */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <SudokuGrid
                  grid={grid}
                  originalGrid={originalGrid}
                  size={gridSize}
                  onChange={handleCellChange}
                  isAnimating={isAnimating}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Fill in the grid manually or generate a puzzle, then watch the algorithm solve it step by step</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
