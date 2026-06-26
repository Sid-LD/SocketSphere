import { useRef, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";

// ─── MessageList ─────────────────────────────────────────────────────────────
// Renders the full message thread for the currently open conversation.
// - "me"   → my messages, aligned to the RIGHT, accent colour bubble
// - "them" → their messages, aligned to the LEFT, muted bubble
// Auto-scrolls to the bottom whenever messages change or conversation switches.

function MessageBubble({ message }) {
  const isMe = message.role === "me";

  return (
    <div
      className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Message bubble */}
      <div
        className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
          isMe
            ? "rounded-br-sm bg-accent text-white"
            : "rounded-bl-sm bg-foreground/8 text-foreground"
        }`}
      >
        {/* Text */}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}

        {/* Image attachment */}
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Image"
            className="mt-1 max-w-xs rounded-xl object-cover"
          />
        )}

        {/* Video attachment */}
        {message.videoUrl && (
          <video
            src={message.videoUrl}
            controls
            className="mt-1 max-w-xs rounded-xl"
          />
        )}

        {/* Timestamp */}
        <p
          className={`mt-1 text-right text-[10px] ${
            isMe ? "text-white/60" : "text-foreground/40"
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

export default function MessageList({ messages, conversationId }) {
  const isMessagesLoading = useChatStore((state) => state.isMessagesLoading);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when messages change or conversation switches
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    // Run again after paint so images etc. are laid out
    requestAnimationFrame(scrollToBottom);
  }, [conversationId, messages?.length]);

  // Loading skeleton
  if (isMessagesLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`h-9 animate-pulse rounded-2xl bg-foreground/10 ${
                i % 2 === 0 ? "w-40" : "w-52"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-foreground/40">
        <p className="text-sm">No messages yet.</p>
        <p className="text-xs">Say hello! 👋</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
