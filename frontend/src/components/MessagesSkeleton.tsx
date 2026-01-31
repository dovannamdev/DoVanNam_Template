interface SkeletonMessageProps {
  isUser?: boolean;
  lines?: number;
  width?: string;
}

function SkeletonMessage({
  isUser = false,
  lines = 2,
  width = "w-2/3",
}: SkeletonMessageProps) {
  const bgColor = isUser ? "bg-indigo-100" : "bg-white";
  const lineColor = isUser ? "bg-indigo-200" : "bg-gray-200";
  const roundedCorner = isUser ? "rounded-br-md" : "rounded-bl-md";
  const justify = isUser ? "justify-end" : "justify-start";

  return (
    <div className={`flex ${justify}`}>
      <div
        className={`${bgColor} rounded-2xl ${roundedCorner} px-5 py-4 ${width} animate-pulse ${!isUser && "shadow-sm"}`}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-3 ${lineColor} rounded mb-2 last:mb-0`}
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MessagesSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <SkeletonMessage lines={3} width="w-3/4" />
      <SkeletonMessage isUser lines={2} width="w-2/3" />
      <SkeletonMessage lines={2} width="w-2/3" />
    </div>
  );
}
