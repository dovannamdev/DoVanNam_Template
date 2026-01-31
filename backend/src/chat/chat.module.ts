import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { Chat, Message, Attachment } from "../entities";
import { OpenaiModule } from "../openai/openai.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Attachment]),
    OpenaiModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
