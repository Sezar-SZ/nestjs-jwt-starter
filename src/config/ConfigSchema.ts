import { z } from "zod";

enum NodeEnv {
    production = "production",
    development = "development",
}

const ConfigSchema = z.object({
    NODE_ENV: z.nativeEnum(NodeEnv),
    COOKIE_SECRET: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    ACCESS_EXPIRATION: z.string(),
    REFRESH_EXPIRATION: z.string(),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string(),
    DB_PORT: z.coerce.number(),
    DB_HOST: z.string(),
    DATABASE_URL: z.string().url(),
    REDIS_PORT: z.coerce.number(),
    REDIS_HOST: z.string(),
    REDIS_URL: z.string().url(),
});

export default () => ConfigSchema.parse(process.env);
