import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-1 shadow-sm ${
          isUser
            ? "bg-[#4F46E5] text-white rounded-br-md"
            : "bg-white text-[#1F2937] rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`http://localhost:2937${attachment.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline cursor-pointer hover:opacity-80 transition-opacity ${isUser ? "text-blue-200" : "text-[#4F46E5]"}`}
              >
                {attachment.originalName}
              </a>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p
          className={`text-[10px] mt-2 ${isUser ? "text-blue-200" : "text-gray-400"}`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
