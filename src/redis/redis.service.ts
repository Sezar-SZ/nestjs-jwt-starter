import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

@Injectable()
export class RedisService {
    redisClient;
    constructor(private config: ConfigService) {
        this.redisClient = createClient({ url: this.config.get("REDIS_URL") });
        this.redisClient.on("error", (err) =>
            console.error("Redis Client Error", err)
        );
    }

    async onModuleInit() {
        await this.redisClient.connect();
    }

    async onModuleDestroy() {
        await this.redisClient.disconnect();
    }

    async set({ key, value, time }) {
        await this.redisClient.set(key, value, { EX: time });
    }

    async get(key) {
        const result = await this.redisClient.get(key);
        return result;
    }

    async del(key) {
        await this.redisClient.del(key);
    }
}
