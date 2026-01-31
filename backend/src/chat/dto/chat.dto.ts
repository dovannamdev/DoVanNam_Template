import { IsString, IsOptional, IsNotEmpty, IsArray } from "class-validator";

export class CreateChatDto {
  @IsString()
  @IsOptional()
  title?: string;
}

export class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  mimeType?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: AttachmentDto[];
}
