import { Controller, Delete, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("inventory")
export class InventoryController {
    constructor(private prisma: PrismaService) {}

    @Get("categories")
    async getItemCategories() {
        return this.prisma.itemCategory.findMany();
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getInventoryItems(@Request() req) {
        const data = await this.prisma.inventory.findUnique({
            where: { userId: req.user.userId },
            select: {
                inventoryItem: {
                    select: {
                        quantity: true,
                        item: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                imageUrl: true,
                                rarity: { select: { name: true } },
                                itemCategory: {
                                    select: { id: true, name: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        return data?.inventoryItem.map(({ quantity, item }) => ({
            ...item,
            quantity,
        }));
    }

    @UseGuards(JwtAuthGuard)
    @Get("tickets")
    async getTickets(@Request() req) {
        const data = await this.prisma.inventoryItem.findFirst({
            where: {
                inventory: { userId: req.user.userId },
                item: { name: "Круточка" },
            },
            select: { id: true, quantity: true },
        });

        return { quantity: data?.quantity || 0 };
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeItem(@Request() req) {
        const itemToDelete = await this.prisma.inventoryItem.findFirst({
            where: {
                inventory: { userId: req.user.userId },
                itemId: req.body.inventoryItemId,
            },
        });

        if (!itemToDelete) return;

        if (itemToDelete.quantity > 1) {
            await this.prisma.inventoryItem.updateMany({
                where: {
                    inventory: { userId: req.user.userId },
                    itemId: req.body.inventoryItemId,
                },
                data: { quantity: { decrement: 1 } },
            });
        } else {
            await this.prisma.inventoryItem.deleteMany({
                where: {
                    inventory: { userId: req.user.userId },
                    itemId: req.body.inventoryItemId,
                },
            });
        }
    }
}
