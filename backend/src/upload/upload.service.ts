import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Attachment } from "../entities";

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
  ) {}

  async saveAttachment(
    messageId: number,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const attachment = this.attachmentRepository.create({
      messageId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      path: file.path,
    });
    return this.attachmentRepository.save(attachment);
  }
}
