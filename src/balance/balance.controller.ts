import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("balance")
export class BalanceController {
    constructor(private prisma: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getBlance(@Request() req) {
        return this.prisma.balance.findUnique({
            where: {
                userId: req.user.userId,
            },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post("energy/spent")
    async spentEnergy(@Request() req) {
        await this.prisma.$executeRaw`
            UPDATE "Balance"
            SET "energy" = "energy" - ${req.body.energy}
            WHERE "userId" = ${req.user.userId}
            AND "energy" >= ${req.body.energy}
        `;
    }
}
