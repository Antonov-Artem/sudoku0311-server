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
    async login(@Request() req, @Response() res) {
        const tokens = await this.authService.login(req.user);

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            maxAge: 60 * 1000,
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            maxAge: 60 * 60 * 1000,
        });

        res.json({ userId: tokens.userId });
    }

    @Post("refresh")
    async refresh(@Request() req, @Response() res) {
        const { userId } = req.body;
        const refreshToken = req.cookies.refreshToken;
        const tokens = await this.authService.refreshAccessToken(
            userId,
            refreshToken,
        );

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            maxAge: 60 * 1000,
        });

        res.json({ userId: tokens.userId });
    }

    @UseGuards(JwtAuthGuard)
    @Post("logout")
    async logout(@Request() req, @Response() res) {
        await this.usersService.setRefreshToken(req.user.userId, null);

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.json({ message: "Logged out" });
    }
}
