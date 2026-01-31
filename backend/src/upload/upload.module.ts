import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { Attachment } from "../entities";

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
