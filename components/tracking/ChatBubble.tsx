import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/mock-data/chat";

export function ChatBubble({ msg }: { msg: ChatMessage }) {
  const fromDriver = msg.from === "driver";
  return (
    <div className={cn("flex", fromDriver ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[80%] px-3 py-2 rounded-lg text-sm",
        fromDriver ? "bg-cream-100 text-ink-900 rounded-bl-sm" : "bg-emerald-500 text-white rounded-br-sm"
      )}>
        {msg.text}
        <div className={cn("text-[10px] mt-1", fromDriver ? "text-ink-500" : "text-cream-100/80")}>{msg.time}</div>
      </div>
    </div>
  );
}
