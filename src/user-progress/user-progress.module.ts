import { Module } from "@nestjs/common";

import { UserProgressController } from "./user-progress.controller";

@Module({
    controllers: [UserProgressController],
})
export class UserProgressModule {}
