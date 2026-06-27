import { useEffect, useState, useRef } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

// ─── SmartReplies ─────────────────────────────────────────────────────────────
// Shows 3 AI-generated reply suggestions above the composer when the last
// message in the conversation was sent by the OTHER person (i.e., it's our turn).
// Clicking a chip fills the composer text so the user can review/edit before sending.
//
// Props:
//   messages       — the current messages array from useChatStore
//   onSelectReply  — callback(text: string) → called when a chip is clicked

export default function SmartReplies({ messages, onSelectReply }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Track the last message id we already fetched for so we don't re-fetch on re-renders
  const lastFetchedMsgId = useRef(null);

  useEffect(() => {
    if (!messages || messages.length === 0) {
      setSuggestions([]);
      return;
    }

    const lastMsg = messages[messages.length - 1];

    // Only suggest replies when the last message is from the OTHER person
    if (lastMsg.role !== "them") {
      setSuggestions([]);
      return;
    }

    // Don't re-fetch if we already have suggestions for this exact message
    if (lastFetchedMsgId.current === lastMsg.id) return;

    // Only include messages that have text (skip pure media messages)
    const textMessages = messages.filter((m) => m.text);
    if (textMessages.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setSuggestions([]);
      lastFetchedMsgId.current = lastMsg.id;
      try {
        const payload = textMessages.map((m) => ({ role: m.role, text: m.text }));
        const res = await axiosInstance.post("/messages/suggest", { messages: payload });
        setSuggestions(res.data.suggestions || []);
      } catch {
        // Silently fail — smart replies are a nice-to-have, not critical
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [messages]);

  // Nothing to show — hide completely
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 pb-1 flex-wrap">
      {/* Icon + loading state */}
      {isLoading ? (
        <span className="flex items-center gap-1 text-[11px] text-foreground/40">
          <Loader2 className="h-3 w-3 animate-spin" />
          AI thinking…
        </span>
      ) : (
        <>
          <Sparkles className="h-3 w-3 shrink-0 text-accent/70" />
          {suggestions.map((text, i) => (
            <button
              key={i}
              onClick={() => onSelectReply(text)}
              className="rounded-full border border-accent/30 bg-accent/8 px-2.5 py-0.5 text-[11px] text-accent transition-colors hover:bg-accent/20"
            >
              {text}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
