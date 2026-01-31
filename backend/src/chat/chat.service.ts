import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { Chat, Message, Attachment } from "../entities";
import { OpenaiService } from "../openai/openai.service";
import { CreateChatDto, SendMessageDto } from "./dto/chat.dto";

export interface PaginatedMessages {
  messages: Message[];
  nextCursor: number | null;
  hasMore: boolean;
  total: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    private openaiService: OpenaiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const chat = this.chatRepository.create({
      title: createChatDto.title || "New Chat",
    });
    const saved = await this.chatRepository.save(chat);

    // Invalidate chats list cache
    await this.cacheManager.del("chats:list");

    return saved;
  }

  async findAllChats(): Promise<Chat[]> {
    // Try cache first
    const cacheKey = "chats:list";
    const cached = await this.cacheManager.get<Chat[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const chats = await this.chatRepository.find({
      order: { createdAt: "DESC" },
    });

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, chats, 300);
    return chats;
  }

  async findChatById(id: number): Promise<Chat> {
    // Try cache first
    const cacheKey = `chat:${id}`;
    const cached = await this.cacheManager.get<Chat>(cacheKey);
    if (cached) {
      return cached;
    }

    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ["messages", "messages.attachments"],
      order: { messages: { createdAt: "ASC" } },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }

    // Cache for 2 minutes
    await this.cacheManager.set(cacheKey, chat, 120);
    return chat;
  }

  // NEW: Paginated messages endpoint
  async getMessagesPaginated(
    chatId: number,
    cursor?: number,
    limit: number = 20,
  ): Promise<PaginatedMessages> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException(`Chat with ID ${chatId} not found`);
    }

    // Build query
    const queryBuilder = this.messageRepository
      .createQueryBuilder("message")
      .leftJoinAndSelect("message.attachments", "attachments")
      .where("message.chatId = :chatId", { chatId })
      .orderBy("message.id", "DESC")
      .take(limit + 1); // Get one extra to check if there's more

    if (cursor) {
      queryBuilder.andWhere("message.id < :cursor", { cursor });
    }

    const messages = await queryBuilder.getMany();

    // Check if there are more messages
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra item
    }

    // Get total count for this chat
    const total = await this.messageRepository.count({
      where: { chatId },
    });

    return {
      messages: messages.reverse(), // Return in chronological order
      nextCursor: hasMore ? messages[0]?.id || null : null,
      hasMore,
      total,
    };
  }

  async sendMessage(
    chatId: number,
    sendMessageDto: SendMessageDto,
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const chat = await this.findChatById(chatId);

    // Save user message
    const userMessage = this.messageRepository.create({
      chatId: chat.id,
      role: "user",
      content: sendMessageDto.content,
    });
    await this.messageRepository.save(userMessage);

    // Save attachments if any
    if (sendMessageDto.attachments && sendMessageDto.attachments.length > 0) {
      const attachmentEntities = sendMessageDto.attachments.map((att) =>
        this.attachmentRepository.create({
          messageId: userMessage.id,
          filename: att.filename,
          originalName: att.filename,
          mimetype: att.mimeType || "application/octet-stream",
          path: att.path,
        }),
      );
      await this.attachmentRepository.save(attachmentEntities);
      userMessage.attachments = attachmentEntities;
    }

    // Update chat title if it's the first message
    if (chat.title === "New Chat") {
      const title =
        sendMessageDto.content.substring(0, 50) +
        (sendMessageDto.content.length > 50 ? "..." : "");
      await this.chatRepository.update(chat.id, { title });
    }

    // Generate AI response with attachments for vision
    const aiResponse = await this.openaiService.generateResponse(
      sendMessageDto.content,
      sendMessageDto.attachments,
    );

    // Save assistant message
    const assistantMessage = this.messageRepository.create({
      chatId: chat.id,
      role: "assistant",
      content: aiResponse,
    });
    await this.messageRepository.save(assistantMessage);

    // Invalidate cache for this chat
    await this.cacheManager.del(`chat:${chatId}`);

    return { userMessage, assistantMessage };
  }

  async deleteChat(id: number): Promise<void> {
    const result = await this.chatRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Chat with ID ${id} not found`);
    }

    // Invalidate caches
    await this.cacheManager.del(`chat:${id}`);
    await this.cacheManager.del("chats:list");
  }
}
