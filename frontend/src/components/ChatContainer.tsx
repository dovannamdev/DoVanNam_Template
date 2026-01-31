import { useRef, useEffect, useCallback, useState } from "react";
import { HiOutlineChevronLeft } from "react-icons/hi";
import type { Message } from "../types";
import MessageBubble from "./MessageBubble";
import MessagesSkeleton from "./MessagesSkeleton";

interface ChatContainerProps {
  messages: Message[];
  isLoading?: boolean;
  isInitialLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function ChatContainer({
  messages,
  isLoading,
  isInitialLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (messages.length > 0 && !isReady) {
      // Initial load - scroll to bottom immediately
      messagesEndRef.current?.scrollIntoView();
      setTimeout(() => setIsReady(true), 300);
    } else if (isReady && !isLoadingMore) {
      // New message - smooth scroll
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isLoading, isReady, isLoadingMore]);

  // Maintain scroll position after loading more
  useEffect(() => {
    if (containerRef.current && prevScrollHeightRef.current > 0 && isReady) {
      const newScrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop =
        newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isReady]);

  // Handle scroll to top for loading more
  const handleScroll = useCallback(() => {
    if (
      !containerRef.current ||
      !onLoadMore ||
      !hasMore ||
      isLoadingMore ||
      !isReady
    )
      return;

    // Load more when scrolled near top (within 50px)
    if (containerRef.current.scrollTop < 50) {
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoadingMore, isReady]);

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {/* Header with Back button */}
      <header className="py-6 px-4">
        <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E5E7EB] rounded-full text-[#1F2937] hover:bg-gray-50 hover:border-[#4F46E5] hover:text-[#4F46E5] cursor-pointer transition-all duration-200 shadow-sm bg-white hover:cursor-not-allowed">
          <HiOutlineChevronLeft size={16} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </header>

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 pb-2"
        onScroll={handleScroll}
      >
        <div className="w-full">
          {/* Loading more skeleton */}
          {isLoadingMore && <MessagesSkeleton />}

          {/* Show load more hint */}
          {hasMore && !isLoadingMore && messages.length > 0 && isReady && (
            <div className="flex justify-center py-2">
              <span className="text-xs text-gray-400">
                ↑ Scroll up for older messages
              </span>
            </div>
          )}

          {/* Initial loading skeleton */}
          {isInitialLoading ? (
            <div className="flex flex-col justify-end h-full">
              <MessagesSkeleton />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Start a conversation by sending a message below.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white rounded-2xl rounded-bl-md px-5 py-2 shadow-sm">
                    <div className="flex gap-1.5">
                      <span
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
