import { Module } from "@nestjs/common";
import { SudokuModule } from "src/sudoku/sudoku.module";

import { GameSessionController } from "./game-session.controller";
import { GameSessionService } from "./game-session.service";

@Module({
    imports: [SudokuModule],
    controllers: [GameSessionController],
    providers: [GameSessionService],
})
export class GameSessionModule {}
