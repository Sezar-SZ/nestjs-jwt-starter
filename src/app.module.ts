import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { RedisModule } from "./redis/redis.module";
import Config from "./config/ConfigSchema";
import { APP_PIPE } from "@nestjs/core";

import { ZodValidationPipe } from "@wahyubucil/nestjs-zod-openapi";

@Module({
    imports: [
        UsersModule,
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
            load: [Config],
        }),
        AuthModule,
        RedisModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        PrismaService,
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
    ],
})
export class AppModule {}
