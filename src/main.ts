import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.enableCors({
        origin: process.env.ALLOWED_ORIGIN,
        credentials: true,
    });

    await app.listen(3000);
};

bootstrap();
