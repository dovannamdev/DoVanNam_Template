export interface Chat {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  messageId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  path: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
