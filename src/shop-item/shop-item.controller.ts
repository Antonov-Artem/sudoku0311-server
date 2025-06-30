import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("shop-item")
export class ShopItemController {
    constructor(private prisma: PrismaService) {}

    @Get()
    async getShopItems() {
        return await this.prisma.shopItem.findMany({
            select: {
                id: true,
                priceInGems: true,
                priceInGold: true,
                item: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        itemCategory: true,
                        rarity: true,
                    },
                },
            },
        });
    }
}
