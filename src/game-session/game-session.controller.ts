import { Body, Controller, Delete, Param, Patch, Post } from "@nestjs/common";

import { GameSessionService } from "./game-session.service";

@Controller("game-session")
export class GameSessionController {
    constructor(private readonly gameSessionService: GameSessionService) {}

    @Post("/get")
    public async getGameSession(
        @Body("userId") userId?: string,
        @Body("sessionId") sessionId?: string,
    ) {
        if (sessionId) {
            return this.gameSessionService.getGameSessionById(sessionId);
        }
        if (userId) {
            return this.gameSessionService.getGameSessionsByUserId(userId);
        }
    }

    @Post("/create")
    public async createGameSession(
        @Body("userId") userId: string,
        @Body("difficulty") difficulty: string,
    ) {
        return this.gameSessionService.createGameSession(userId, difficulty);
    }

    @Patch("/update")
    public async updateGameSession(
        @Body("userId") userId: string,
        @Body("updates")
        updates: {
            currentBoard: number[][];
            score: number;
            time: number;
            errors: number;
        },
    ) {
        return this.gameSessionService.updateGameSession(userId, updates);
    }

    @Delete(":id")
    public async deleteGameSession(@Param("id") sessionId: string) {
        return this.gameSessionService.deleteGameSession(sessionId);
    }
}
