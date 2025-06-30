import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("task")
export class TaskController {
    constructor(private prismaService: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserTasks(@Request() req) {
        const res = await this.prismaService.userTask.findMany({
            where: { userId: req.user.userId },
            select: {
                id: true,
                progress: true,
                claimed: true,
                task: {
                    select: {
                        description: true,
                        goal: true,
                    },
                },
            },
        });

        return res.map(task => ({
            id: task.id,
            description: task.task.description,
            goal: task.task.goal,
            progress: task.progress,
            isCompleted: task.progress >= task.task.goal,
            isClaimed: task.claimed,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Post("set")
    async setUserTask(@Request() req) {
        await this.prismaService.userTask.updateMany({
            where: { userId: req.user.userId, task: { type: req.body.type } },
            data: {
                progress: {
                    increment: req.body.progress,
                },
            },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post("claim")
    async claimUserTaskActivityPoints(@Request() req) {
        await this.prismaService.userTask.update({
            where: { id: req.body.userTaskId },
            data: { claimed: true },
        });

        const userTask = await this.prismaService.userTask.findUnique({
            where: { id: req.body.userTaskId },
            select: {
                claimed: true,
                task: { select: { activityPoints: true } },
            },
        });

        if (!userTask) {
            throw new Error("Matching userTask not found");
        }

        const balance = await this.prismaService.balance.findUnique({
            where: { userId: req.user.userId },
        });

        if (!balance) return;

        const activityRewards =
            await this.prismaService.activityReward.findMany({
                where: {
                    activityPoints: {
                        gte: balance.activityPoints,
                        lte:
                            balance.activityPoints +
                            userTask.task.activityPoints,
                    },
                },
            });

        await this.prismaService.balance.update({
            where: { userId: req.user.userId },
            data: {
                activityPoints: {
                    increment: userTask.task.activityPoints,
                },
            },
        });

        const rewardIds = activityRewards.map(r => r.id);

        const existingRewards =
            await this.prismaService.userActivityReward.findMany({
                where: {
                    userId: req.user.userId,
                    activityRewardId: { in: rewardIds },
                },
                select: { activityRewardId: true },
            });

        const existingRewardIds = new Set(
            existingRewards.map(r => r.activityRewardId),
        );

        const newRewards = activityRewards
            .filter(r => !existingRewardIds.has(r.id))
            .map(r => ({
                userId: req.user.userId,
                activityRewardId: r.id,
                claimed: false,
            }));

        if (newRewards.length > 0) {
            await this.prismaService.userActivityReward.createMany({
                data: newRewards,
            });
        }
    }
}
