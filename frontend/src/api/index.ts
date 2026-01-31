import axios from "axios";
import type { Chat, Message, ApiResponse } from "../types";

// Use VITE_API_URL with /api prefix, or default to /api for nginx proxy
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Paginated messages response type
export interface PaginatedMessages {
  messages: Message[];
  nextCursor: number | null;
  hasMore: boolean;
  total: number;
}

export const chatApi = {
  // Create a new chat
  createChat: async (): Promise<Chat> => {
    const response = await api.post<ApiResponse<Chat>>("/chats");
    return response.data.data;
  },

  // Get all chats
  getAllChats: async (): Promise<Chat[]> => {
    const response = await api.get<ApiResponse<Chat[]>>("/chats");
    return response.data.data;
  },

  // Get chat by ID with messages
  getChatById: async (id: number): Promise<Chat> => {
    const response = await api.get<ApiResponse<Chat>>(`/chats/${id}`);
    return response.data.data;
  },

  // NEW: Get messages with pagination
  getMessagesPaginated: async (
    chatId: number,
    cursor?: number,
    limit: number = 20,
  ): Promise<PaginatedMessages> => {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor.toString());
    params.append("limit", limit.toString());

    const response = await api.get<ApiResponse<PaginatedMessages>>(
      `/chats/${chatId}/messages?${params.toString()}`,
    );
    return response.data.data;
  },

  // Send message and get AI response
  sendMessage: async (
    chatId: number,
    content: string,
    attachments?: { filename: string; path: string; mimeType?: string }[],
  ): Promise<{ userMessage: Message; assistantMessage: Message }> => {
    const response = await api.post<
      ApiResponse<{ userMessage: Message; assistantMessage: Message }>
    >(`/chats/${chatId}/messages`, { content, attachments });
    return response.data.data;
  },

  // Delete chat
  deleteChat: async (id: number): Promise<void> => {
    await api.delete(`/chats/${id}`);
  },

  // Upload files
  uploadFiles: async (
    files: File[],
  ): Promise<{ filename: string; path: string }[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },
};

export default api;
