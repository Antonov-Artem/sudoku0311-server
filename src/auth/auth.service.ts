import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async validateUser(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }

        return null;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) return;

        const payload = { email: user.email, sub: user.id };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: "1m",
            secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: "1h",
            secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        });

        await this.usersService.setRefreshToken(user.id, refreshToken);

        return {
            userId: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    }

    async refreshAccessToken(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);

        if (!user || user.refreshToken !== refreshToken) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        try {
            this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch (e) {
            this.usersService.setRefreshToken(userId, null);
            throw new UnauthorizedException("Refresh token expired");
        }

        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: "1m",
            secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        });

        return {
            userId: user.id,
            accessToken: accessToken,
        };
    }
}
