import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { ChatModule } from "./chat/chat.module";
import { UploadModule } from "./upload/upload.module";
import { Chat, Message, Attachment } from "./entities";

@Module({
  imports: [
    // Database
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      username: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "chat_app",
      entities: [Chat, Message, Attachment],
      synchronize: true, // Set to false in production
    }),

    // Rate Limiting module (applied per-endpoint, not globally)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 30,
      },
    ]),

    // Redis Cache - 5 minutes TTL
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      ttl: 300, // 5 minutes
      isGlobal: true,
    }),

    ChatModule,
    UploadModule,
  ],
  // No global guard - rate limiting applied per-endpoint
})
export class AppModule {}
