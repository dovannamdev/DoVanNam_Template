import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";

export interface ImageAttachment {
  filename: string;
  path: string;
  mimeType?: string;
}

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Convert image file to base64 data URL
  private imageToBase64(filePath: string, mimeType?: string): string {
    const absolutePath = path.join(process.cwd(), filePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64 = imageBuffer.toString("base64");
    const mime = mimeType || this.getMimeType(filePath);
    return `data:${mime};base64,${base64}`;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    return mimeTypes[ext] || "image/jpeg";
  }

  private isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
  }

  async generateResponse(
    userMessage: string,
    attachments?: ImageAttachment[],
  ): Promise<string> {
    try {
      // Build content array for GPT-4o vision
      const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

      // Add text message
      content.push({
        type: "text",
        text: userMessage,
      });

      // Add images if present
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (this.isImageFile(attachment.path)) {
            try {
              const base64Url = this.imageToBase64(
                attachment.path,
                attachment.mimeType,
              );
              content.push({
                type: "image_url",
                image_url: {
                  url: base64Url,
                  detail: "auto",
                },
              });
            } catch (err) {
              console.error(`Failed to read image ${attachment.path}:`, err);
            }
          }
        }
      }

      // Use GPT-4o for vision support, fallback to gpt-3.5-turbo if no images
      const hasImages = content.some((c) => c.type === "image_url");
      const model = hasImages ? "gpt-4o" : "gpt-3.5-turbo";

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. When images are provided, describe and analyze them thoroughly. Be concise and helpful.",
          },
          {
            role: "user",
            content: hasImages ? content : userMessage,
          },
        ],
        max_tokens: 1500,
      });

      return (
        completion.choices[0]?.message?.content ||
        "Sorry, I could not generate a response."
      );
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}
