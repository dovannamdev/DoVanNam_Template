import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:2937";

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const isImage = (mimetype: string) => mimetype?.startsWith("image/");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-1 shadow-sm ${
          isUser
            ? "bg-[#4F46E5] text-white rounded-br-md"
            : "bg-white text-[#1F2937] rounded-bl-md"
        }`}
      >
        {/* Attachments - Show before content for user messages */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {isImage(attachment.mimetype) ? (
                  <a
                    href={`${API_URL}${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={`${API_URL}${attachment.path}`}
                      alt={attachment.originalName}
                      className="max-w-[200px] max-h-[150px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <a
                    href={`${API_URL}${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      isUser
                        ? "bg-indigo-400/30 text-blue-100 hover:bg-indigo-400/50"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    <span>📎</span>
                    <span className="truncate max-w-[150px]">
                      {attachment.originalName}
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

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
