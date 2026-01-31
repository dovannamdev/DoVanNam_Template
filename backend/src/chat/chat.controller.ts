import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { ChatService } from "./chat.service";
import { CreateChatDto, SendMessageDto } from "./dto/chat.dto";

@Controller("api/chats")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService.createChat(createChatDto);
    return { success: true, data: chat };
  }

  @Get()
  async findAllChats() {
    const chats = await this.chatService.findAllChats();
    return { success: true, data: chats };
  }

  @Get(":id")
  async findChatById(@Param("id", ParseIntPipe) id: number) {
    const chat = await this.chatService.findChatById(id);
    return { success: true, data: chat };
  }

  @Get(":id/messages")
  async getMessagesPaginated(
    @Param("id", ParseIntPipe) id: number,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const result = await this.chatService.getMessagesPaginated(
      id,
      cursor ? parseInt(cursor) : undefined,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, data: result };
  }

  // Rate limit only for send message (protects OpenAI API costs)
  @Post(":id/messages")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 messages per minute
  async sendMessage(
    @Param("id", ParseIntPipe) id: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const result = await this.chatService.sendMessage(id, sendMessageDto);
    return { success: true, data: result };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChat(@Param("id", ParseIntPipe) id: number) {
    await this.chatService.deleteChat(id);
  }
}
