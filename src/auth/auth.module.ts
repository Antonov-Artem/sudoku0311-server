import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { UsersModule } from "../users/users.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";

@Module({
    imports: [UsersModule, PassportModule, JwtModule.register({})],
    providers: [
        AuthService,
        LocalStrategy,
        {
            provide: JwtStrategy,
            useFactory: (configService: ConfigService) =>
                new JwtStrategy(configService),
            inject: [ConfigService],
        },
    ],
    controllers: [AuthController],
})
export class AuthModule {}
