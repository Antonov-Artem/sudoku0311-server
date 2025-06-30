import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CleanUpService {
    constructor(private prisma: PrismaService) {}

    @Cron("0 4 * * *", { timeZone: "Europe/Kyiv" })
    async resetBalance() {
        await this.prisma.balance.updateMany({ data: { activityPoints: 0 } });
        await this.prisma.userActivityReward.deleteMany();
        await this.prisma.userTask.updateMany({
            data: { claimed: false, progress: 0 },
        });
    }
}
