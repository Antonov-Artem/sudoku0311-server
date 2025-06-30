import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.enableCors({
        origin: "http://localhost:5173",
        credentials: true,
    });

    await app.listen(3000);
};

bootstrap();
