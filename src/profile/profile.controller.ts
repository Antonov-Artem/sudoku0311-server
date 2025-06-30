import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("profile")
export class ProfileController {
    constructor(private prismaService: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getProfile(@Request() req) {
        const profile = await this.prismaService.profile.findUnique({
            where: { userId: req.user.userId },
            select: {
                userId: true,
                level: true,
                avatarUrl: true,
                user: { select: { name: true } },
            },
        });

        return {
            userId: profile?.userId,
            userName: profile?.user.name,
            level: profile?.level,
            avatarUrl: profile?.avatarUrl,
        };
    }
}
