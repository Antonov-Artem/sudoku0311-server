import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("activity-reward")
export class ActivityRewardController {
    constructor(private prismaService: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getActivityRewards(@Request() req) {
        const res = await this.prismaService.userActivityReward.findMany({
            where: { userId: req.user.userId },
            select: {
                claimed: true,
                activityReward: {
                    select: {
                        activityPoints: true,
                        reward: {
                            select: {
                                quantity: true,
                                currency: { select: { name: true } },
                            },
                        },
                    },
                },
            },
        });

        return [
            ...res.sort(
                (a, b) =>
                    a.activityReward.activityPoints -
                    b.activityReward.activityPoints,
            ),
            ...(res.length < 4 ? new Array(4 - res.length).fill(null) : []),
        ];
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async claimActivityReward(@Request() req) {
        const inventory = await this.prismaService.inventory.findUnique({
            where: { userId: req.user.userId },
            select: { id: true },
        });

        if (!inventory) {
            throw new Error("Inventory not found for user");
        }

        const userActivityRewards =
            await this.prismaService.userActivityReward.updateManyAndReturn({
                where: {
                    userId: req.user.userId,
                    activityReward: { activityPoints: req.body.activityPoints },
                },
                data: { claimed: true },
                select: {
                    claimed: true,
                    activityReward: {
                        select: {
                            reward: {
                                select: {
                                    currency: { select: { name: true } },
                                    item: { select: { id: true, name: true } },
                                    quantity: true,
                                },
                            },
                        },
                    },
                },
            });

        userActivityRewards.forEach(async r => {
            if (r.activityReward.reward.currency) {
                await this.prismaService.balance.update({
                    where: { userId: req.user.userId },
                    data: {
                        gold: {
                            increment:
                                r.activityReward.reward.currency?.name ===
                                "gold"
                                    ? r.activityReward.reward.quantity
                                    : 0,
                        },
                        gems: {
                            increment:
                                r.activityReward.reward.currency?.name === "gem"
                                    ? r.activityReward.reward.quantity
                                    : 0,
                        },
                    },
                });

                return r.activityReward.reward;
            } else if (r.activityReward.reward.item) {
                const item = await this.prismaService.inventoryItem.findFirst({
                    where: {
                        inventoryId: inventory.id,
                        itemId: r.activityReward.reward.item.id,
                    },
                    select: { id: true, quantity: true },
                });

                if (!item) {
                    await this.prismaService.inventoryItem.create({
                        data: {
                            inventoryId: inventory.id,
                            itemId: r.activityReward.reward.item.id,
                            quantity: r.activityReward.reward.quantity,
                        },
                    });
                } else {
                    await this.prismaService.inventoryItem.update({
                        where: { id: item.id },
                        data: {
                            quantity:
                                item.quantity +
                                r.activityReward.reward.quantity,
                        },
                    });
                }

                return r.activityReward.reward;
            } else {
                throw new Error("Uknown type of reward");
            }
        });
    }
}
