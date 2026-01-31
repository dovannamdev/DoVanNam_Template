import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

const storage = diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller("api/upload")
export class UploadController {
  @Post()
  @UseInterceptors(FilesInterceptor("files", 10, { storage }))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return {
      success: true,
      data: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
      })),
    };
  }

  @Post("single")
  @UseInterceptors(FileInterceptor("file", { storage }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      success: true,
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
      },
    };
  }
}
