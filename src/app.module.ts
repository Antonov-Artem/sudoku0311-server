import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

import { ActivityRewardModule } from "./activity-reward/activity-reward.module";
import { AuthModule } from "./auth/auth.module";
import { BalanceController } from "./balance/balance.controller";
import { BalanceService } from "./balance/balance.service";
import { CleanUpService } from "./clean-up.service";
import { InventoryModule } from "./inventory/inventory.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfileController } from "./profile/profile.controller";
import { PurchaseModule } from "./purchase/purchase.module";
import { ShopItemModule } from "./shop-item/shop-item.module";
import { TaskModule } from "./task/task.module";
import { UsersModule } from "./users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === "production"
                    ? ".env.production"
                    : ".env",
        }),
        ScheduleModule.forRoot(),
        AuthModule,
        UsersModule,
        PrismaModule,
        TaskModule,
        ActivityRewardModule,
        InventoryModule,
        PurchaseModule,
        ShopItemModule,
    ],
    controllers: [ProfileController, BalanceController],
    providers: [CleanUpService, BalanceService],
})
export class AppModule {}
