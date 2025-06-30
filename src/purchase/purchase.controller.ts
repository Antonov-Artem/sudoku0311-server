import { Controller, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("purchase")
export class PurchaseController {
    constructor(private prisma: PrismaService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async makePurchase(@Request() req) {
        const { shopItemId, quantity } = req.body;

        const shopItem = await this.prisma.shopItem.findUnique({
            where: { id: shopItemId },
            select: {
                id: true,
                priceInGold: true,
                priceInGems: true,
                item: { select: { id: true } },
            },
        });

        if (!shopItem) return;

        console.log(shopItem);

        let purchaseCost: number;

        const balance = await this.prisma.balance.findUnique({
            where: { userId: req.user.userId },
        });

        if (!balance) return;

        const inventory = await this.prisma.inventory.findUnique({
            where: { userId: req.user.userId },
            select: { id: true },
        });

        if (!inventory) return;

        if (shopItem.priceInGold) {
            purchaseCost = shopItem.priceInGold * quantity;

            if (purchaseCost > balance.gold) {
                return { message: "Недостаточно средств для покупки" };
            }

            await this.prisma.balance.update({
                where: { userId: req.user.userId },
                data: { gold: { decrement: purchaseCost } },
            });
        } else if (shopItem.priceInGems) {
            purchaseCost = shopItem.priceInGems * quantity;

            if (purchaseCost > balance.gems) {
                return { message: "Недостаточно средств для покупки" };
            }

            await this.prisma.balance.update({
                where: { userId: req.user.userId },
                data: { gems: { decrement: purchaseCost } },
            });
        } else {
            return;
        }

        const inventoryItem = await this.prisma.inventoryItem.findFirst({
            where: { inventoryId: inventory.id, itemId: shopItem.item.id },
        });

        if (inventoryItem) {
            await this.prisma.inventoryItem.updateMany({
                where: { inventoryId: inventory.id, itemId: shopItem.item.id },
                data: { quantity: { increment: quantity } },
            });
        } else {
            await this.prisma.inventoryItem.create({
                data: {
                    inventoryId: inventory.id,
                    itemId: shopItem.item.id,
                    quantity,
                },
            });
        }
    }
}
