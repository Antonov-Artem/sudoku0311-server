import { Injectable } from "@nestjs/common";

type Board = number[][];
export type Difficulty = "easy" | "medium" | "hard";

const SIZE = 9;
const BOX_SIZE = 3;

class SudokuHelper {
    board: Board;
    rowUsed: Set<number>[];
    colUsed: Set<number>[];
    boxUsed: Set<number>[];

    constructor(
        board: Board,
        private readonly outer: SudokuService,
    ) {
        this.board = board;
        this.rowUsed = Array.from({ length: SIZE }, () => new Set());
        this.colUsed = Array.from({ length: SIZE }, () => new Set());
        this.boxUsed = Array.from({ length: SIZE }, () => new Set());
        this.initializeSets();
    }

    private boxIndex(row: number, col: number): number {
        return (
            Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE)
        );
    }

    private initializeSets() {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const num = this.board[r][c];
                if (num !== 0) {
                    this.rowUsed[r].add(num);
                    this.colUsed[c].add(num);
                    this.boxUsed[this.boxIndex(r, c)].add(num);
                }
            }
        }
    }

    isValid(row: number, col: number, num: number): boolean {
        return (
            !this.rowUsed[row].has(num) &&
            !this.colUsed[col].has(num) &&
            !this.boxUsed[this.boxIndex(row, col)].has(num)
        );
    }

    placeNumber(row: number, col: number, num: number) {
        this.board[row][col] = num;
        this.rowUsed[row].add(num);
        this.colUsed[col].add(num);
        this.boxUsed[this.boxIndex(row, col)].add(num);
    }

    removeNumber(row: number, col: number, num: number) {
        this.board[row][col] = 0;
        this.rowUsed[row].delete(num);
        this.colUsed[col].delete(num);
        this.boxUsed[this.boxIndex(row, col)].delete(num);
    }
}

@Injectable()
export class SudokuService {
    private createEmptyBoard(): Board {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    private shuffledNumbers(): number[] {
        const arr = Array.from({ length: SIZE }, (_, i) => i + 1);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    private fillBoard(
        helper: InstanceType<typeof SudokuHelper>,
        row = 0,
        col = 0,
    ): boolean {
        if (row === SIZE) return true;

        const [nextRow, nextCol] =
            col === SIZE - 1 ? [row + 1, 0] : [row, col + 1];

        if (helper.board[row][col] !== 0) {
            return this.fillBoard(helper, nextRow, nextCol);
        }

        for (const num of this.shuffledNumbers()) {
            if (helper.isValid(row, col, num)) {
                helper.placeNumber(row, col, num);
                if (this.fillBoard(helper, nextRow, nextCol)) return true;
                helper.removeNumber(row, col, num);
            }
        }

        return false;
    }

    private countSolutions(
        helper: InstanceType<typeof SudokuHelper>,
        limit = 2,
        row = 0,
        col = 0,
    ): number {
        if (row === SIZE) return 1;

        const [nextRow, nextCol] =
            col === SIZE - 1 ? [row + 1, 0] : [row, col + 1];

        if (helper.board[row][col] !== 0) {
            return this.countSolutions(helper, limit, nextRow, nextCol);
        }

        let solutions = 0;
        for (let num = 1; num <= SIZE; num++) {
            if (helper.isValid(row, col, num)) {
                helper.placeNumber(row, col, num);
                solutions += this.countSolutions(
                    helper,
                    limit,
                    nextRow,
                    nextCol,
                );
                helper.removeNumber(row, col, num);
                if (solutions >= limit) return solutions;
            }
        }

        return solutions;
    }

    private getCellsToRemove(difficulty: Difficulty): number {
        switch (difficulty) {
            case "easy":
                return this.randomInt(35, 45);
            case "medium":
                return this.randomInt(46, 53);
            case "hard":
                return this.randomInt(54, 64);
            default:
                return 40;
        }
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateFullBoard(): Board {
        const board = this.createEmptyBoard();
        const helper = new SudokuHelper(board, this);
        if (!this.fillBoard(helper))
            throw new Error("Sudoku generation failed");
        return helper.board;
    }

    generatePuzzle(cellsToRemove = 40): Board {
        const fullBoard = this.generateFullBoard();
        const puzzle = fullBoard.map(row => [...row]);
        let removed = 0;

        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * SIZE);
            const col = Math.floor(Math.random() * SIZE);
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }

        return puzzle;
    }

    generateUniquePuzzle(cellsToRemove = 40): Board {
        const board = this.generateFullBoard();
        const helper = new SudokuHelper(board, this);

        const positions: [number, number][] = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                positions.push([r, c]);
            }
        }

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        let removed = 0;
        const maxAttempts = positions.length;

        for (
            let attempt = 0;
            attempt < maxAttempts && removed < cellsToRemove;
            attempt++
        ) {
            const [row, col] = positions[attempt];
            const temp = helper.board[row][col];
            if (temp === 0) continue;

            helper.removeNumber(row, col, temp);
            const solutions = this.countSolutions(helper, 2);
            if (solutions !== 1) {
                helper.placeNumber(row, col, temp);
            } else {
                removed++;
            }
        }

        return helper.board;
    }

    generateUniquePuzzleWithSolution(cellsToRemove = 40): {
        initialBoard: Board;
        solvedBoard: Board;
    } {
        const solution = this.generateFullBoard();
        const helper = new SudokuHelper(
            solution.map(row => [...row]),
            this,
        );

        const positions: [number, number][] = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                positions.push([r, c]);
            }
        }

        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        let removed = 0;
        const maxAttempts = positions.length;

        for (
            let attempt = 0;
            attempt < maxAttempts && removed < cellsToRemove;
            attempt++
        ) {
            const [row, col] = positions[attempt];
            const temp = helper.board[row][col];
            if (temp === 0) continue;

            helper.removeNumber(row, col, temp);
            const solutions = this.countSolutions(helper, 2);
            if (solutions !== 1) {
                helper.placeNumber(row, col, temp);
            } else {
                removed++;
            }
        }

        return {
            initialBoard: helper.board,
            solvedBoard: solution,
        };
    }

    generatePuzzleByDifficulty(difficulty: Difficulty) {
        const cellsToRemove = this.getCellsToRemove(difficulty);
        return this.generateUniquePuzzleWithSolution(cellsToRemove);
    }
}
