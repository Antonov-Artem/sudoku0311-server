import { Controller, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("user-progress")
export class UserProgressController {
    constructor(private prismaService: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async setUserProgres(@Request() req) {
        return await this.prismaService.userProgress.update({
            where: { userId: req.user.userId },
            data: { ...req.body },
        });
    }
}
