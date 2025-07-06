import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async createUser(email: string, password: string, name: string) {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        await this.prisma.profile.create({
            data: {
                userId: user.id,
                avatarUrl: "",
                level: 1,
            },
        });

        await this.prisma.balance.create({
            data: {
                userId: user.id,
                energy: 300,
                gold: 0,
                gems: 0,
                activityPoints: 0,
            },
        });

        await this.prisma.inventory.create({ data: { userId: user.id } });

        const allTasks = await this.prisma.task.findMany();

        await this.prisma.userTask.createMany({
            data: allTasks.map(task => ({
                userId: user.id,
                taskId: task.id,
                progress: 0,
                claimed: false,
            })),
        });

        return user;
    }

    async setRefreshToken(userId: string, refreshToken: string | null) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }
}
