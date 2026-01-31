import { useState, useRef, type KeyboardEvent } from "react";
import { HiOutlinePlus, HiOutlineSparkles } from "react-icons/hi";

interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  isLoading?: boolean;
}

export default function ChatInput({
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), files.length > 0 ? files : undefined);
      setMessage("");
      setFiles([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-5">
        {/* File preview */}
        {files.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600"
              >
                <span>{file.name}</span>
                <button
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Row 1: Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask template.net"
          rows={1}
          className="w-full resize-none outline-none text-[#1F2937] placeholder-[#9CA3AF] text-base leading-relaxed mb-4 bg-transparent"
          style={{ minHeight: "28px", maxHeight: "120px" }}
        />

        {/* Row 2: Plus button and Generate button */}
        <div className="flex items-center justify-between">
          {/* Plus button */}
          <button
            onClick={handlePlusClick}
            className="w-10 h-10 flex items-center justify-center text-[#1F2937] hover:bg-gray-100 hover:text-[#4F46E5] rounded-xl cursor-pointer transition-all duration-200"
          >
            <HiOutlinePlus size={22} />
          </button>

          {/* Generate Free button */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl hover:bg-[#4338CA] hover:shadow-lg cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <HiOutlineSparkles size={18} />
            <span className="text-sm font-medium">
              {isLoading ? "Generating..." : "Generate Free"}
            </span>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
}
