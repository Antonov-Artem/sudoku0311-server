import { Injectable } from "@nestjs/common";
import { Difficulty, SudokuService } from "src/sudoku/sudoku.service";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class GameSessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly sudokuService: SudokuService,
    ) {}

    public async getGameSessionById(sessionId: string) {
        return this.prisma.gameSession.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                difficulty: { select: { name: true } },
                currentBoard: true,
                initialBoard: true,
                solvedBoard: true,
                score: true,
                time: true,
                errors: true,
            },
        });
    }

    public async getGameSessionsByUserId(userId: string) {
        return this.prisma.gameSession.findMany({
            where: { userId },
            select: {
                id: true,
                difficulty: { select: { name: true } },
                currentBoard: true,
                initialBoard: true,
                solvedBoard: true,
                score: true,
                time: true,
                errors: true,
            },
        });
    }

    public async createGameSession(userId: string, difficulty: string) {
        const diff = difficulty as Difficulty;

        const { initialBoard, solvedBoard } =
            this.sudokuService.generatePuzzleByDifficulty(diff);

        const difficultyId = await this.prisma.difficulty.findFirst({
            where: { name: difficulty },
            select: { id: true },
        });

        if (!difficultyId) {
            throw new Error(`Difficulty "${difficulty}" not found`);
        }

        return this.prisma.gameSession.create({
            data: {
                userId,
                difficultyId: difficultyId.id,
                currentBoard: initialBoard,
                initialBoard,
                solvedBoard,
                score: 0,
                time: 0,
                errors: 0,
            },
        });
    }

    public async updateGameSession(
        userId: string,
        updates: Partial<{
            currentBoard: number[][];
            score: number;
            time: number;
            errors: number;
        }>,
    ) {
        return this.prisma.gameSession.update({
            where: { userId: userId },
            data: updates,
        });
    }

    public async deleteGameSession(sessionId: string) {
        return this.prisma.gameSession.delete({ where: { id: sessionId } });
    }
}
