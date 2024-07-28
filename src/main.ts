import "@wahyubucil/nestjs-zod-openapi/boot";

import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

import { patchNestjsSwagger } from "@wahyubucil/nestjs-zod-openapi";

import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle("NestJS Template")
        .setDescription("The NestJS Template API description")
        .setVersion("1.0")
        .addTag("NestJS Template")
        .build();

    patchNestjsSwagger({ schemasSort: "alpha" });

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, document);

    app.use(cookieParser(process.env.COOKIE_SECRET));
    await app.listen(5000);
}
bootstrap();
