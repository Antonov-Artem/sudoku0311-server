import {
    Body,
    Controller,
    Post,
    Request,
    Response,
    UseGuards,
} from "@nestjs/common";

import { UsersService } from "../users/users.service";

import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LocalAuthGuard } from "./local-auth.guard";

const isProd = process.env.NODE_ENV === "production";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) {}

    @Post("register")
    async register(
        @Body() body: { email: string; password: string; name: string },
    ) {
        const user = await this.usersService.createUser(
            body.email,
            body.password,
            body.name,
        );

        return { message: "User created", userId: user.id };
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(
        @Body("email") email: string,
        @Body("password") password: string,
    ) {
        const tokens = await this.authService.login(email, password);

        if (!tokens) return;

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: tokens.userId,
        };
    }

    @Post("refresh")
    async refresh(@Request() req) {
        const { userId, refreshToken } = req.body;

        const tokens = await this.authService.refreshAccessToken(
            userId,
            refreshToken,
        );

        return {
            accessToken: tokens.accessToken,
            refreshToken: refreshToken,
            userId: tokens.userId,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    async logout(@Request() req) {
        await this.usersService.setRefreshToken(req.user.userId, null);
        return { message: "Logged out" };
    }
}
