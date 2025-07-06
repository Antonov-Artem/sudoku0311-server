import { Module } from "@nestjs/common";

import { ShopItemController } from "./shop-item.controller";

@Module({
    controllers: [ShopItemController],
})
export class ShopItemModule {}
