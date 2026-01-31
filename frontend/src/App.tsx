import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar, ChatInput, ChatContainer } from "./components";
import { chatApi } from "./api";
import type { Chat, Message } from "./types";
import "./index.css";

function App() {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const isInitialLoadRef = useRef(true);

  // Create or get existing chat on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const chats = await chatApi.getAllChats();
        if (chats.length > 0) {
          // Only set chat info, don't load all messages
          setCurrentChat({
            id: chats[0].id,
            title: chats[0].title,
            createdAt: chats[0].createdAt,
            updatedAt: chats[0].updatedAt,
          });

          // Load messages with pagination (latest 20 messages)
          const result = await chatApi.getMessagesPaginated(
            chats[0].id,
            undefined,
            20,
          );
          setMessages(result.messages);
          setHasMore(result.hasMore);
          setNextCursor(result.nextCursor);
          setIsInitialLoading(false);

          // Mark initial load as complete after a delay
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 500);
        } else {
          const newChat = await chatApi.createChat();
          setCurrentChat(newChat);
          setMessages([]);
          setIsInitialLoading(false);
          isInitialLoadRef.current = false;
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        try {
          const newChat = await chatApi.createChat();
          setCurrentChat(newChat);
          setMessages([]);
        } catch (e) {
          console.error("Failed to create chat:", e);
        }
        setIsInitialLoading(false);
        isInitialLoadRef.current = false;
      }
    };

    initChat();
  }, []);

  // Load more messages when scrolling to top
  const handleLoadMore = useCallback(async () => {
    // Don't load more during initial load
    if (isInitialLoadRef.current) return;
    if (!currentChat || !hasMore || isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      const result = await chatApi.getMessagesPaginated(
        currentChat.id,
        nextCursor,
        20,
      );
      setMessages((prev) => [...result.messages, ...prev]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentChat, hasMore, isLoadingMore, nextCursor]);

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!currentChat) return;

    // Create optimistic user message
    const tempUserMessage: Message = {
      id: Date.now(),
      chatId: currentChat.id,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    // Show user message immediately (optimistic update)
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      let attachments:
        | { filename: string; path: string; mimeType?: string }[]
        | undefined;

      if (files && files.length > 0) {
        const uploadedFiles = await chatApi.uploadFiles(files);
        attachments = uploadedFiles.map((f, i) => ({
          filename: f.filename,
          path: f.path,
          mimeType: files[i].type || undefined,
        }));
      }

      const { userMessage, assistantMessage } = await chatApi.sendMessage(
        currentChat.id,
        content,
        attachments,
      );

      // Replace temp message with real one and add assistant response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessage.id),
        userMessage,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        chatId: currentChat.id,
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please check your OpenAI API key and try again.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <Sidebar />

      <main className="flex-1 flex flex-col items-center overflow-hidden max-h-screen">
        <div
          style={{ width: "100%", maxWidth: "700px" }}
          className="flex-1 flex flex-col px-4 overflow-hidden"
        >
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        </div>

        <div
          style={{ width: "100%", maxWidth: "700px" }}
          className="shrink-0 px-4 pb-6"
        >
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default App;
