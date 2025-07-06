import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BalanceService {
    constructor(private prisma: PrismaService) {}

    @Cron("*/5 * * * *")
    async restoreEnergy() {
        await this.prisma.balance.updateMany({
            where: { energy: { lt: 300 } },
            data: { energy: { increment: 1 } },
        });
    }
}
