import { PrismaClient } from "@prisma/client";

import currencies from "../../data/currencies.json";
import difficulties from "../../data/difficulties.json";
import itemCategories from "../../data/item-categories.json";
import rarities from "../../data/rarities.json";
import taskTypes from "../../data/task-types.json";
import tasks from "../../data/tasks.json";

const prisma = new PrismaClient();

async function main() {
    await prisma.difficulty.createMany({
        data: difficulties.map(({ name }) => ({ name })),
    });

    await prisma.rarity.createMany({
        data: rarities.map(({ name }) => ({ name })),
    });

    await prisma.currency.createMany({
        data: currencies.map(({ name }) => ({ name })),
    });

    await prisma.itemCategory.createMany({
        data: itemCategories.map(({ name }) => ({ name })),
    });

    await prisma.taskType.createMany({
        data: taskTypes.map(({ name }) => ({ name })),
    });

    await prisma.task.createMany({
        data: tasks.map(({ type, description, activityPoints, goal }) => ({
            type,
            description,
            activityPoints,
            goal,
        })),
    });
}

main()
    .then(() => {
        console.log("seed.ts was executed succesfully!");
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    })

    .finally(async () => {
        await prisma.$disconnect();
    });
