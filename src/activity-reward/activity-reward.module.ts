import { Module } from "@nestjs/common";

import { ActivityRewardController } from "./activity-reward.controller";

@Module({
    controllers: [ActivityRewardController],
})
export class ActivityRewardModule {}
