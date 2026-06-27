import { useRef } from "react";
import { SendHorizontal, ImagePlus, Loader2 } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import SmartReplies from "./SmartReplies";

// ─── ChatComposer ─────────────────────────────────────────────────────────────
// The message input bar at the bottom of the chat panel.
// - Text input: controlled by composerText in the store
// - Send button: calls sendTextMessage on click or Enter key
// - Image/file upload button: calls sendMediaMessage
// - isSendingMedia flag: disables controls while upload is in progress
// - SmartReplies: AI suggestions shown when the last message is from the other person

export default function ChatComposer({ conversationId, messages }) {
  const composerText = useChatStore((state) => state.composerText);
  const setComposerText = useChatStore((state) => state.setComposerText);
  const sendTextMessage = useChatStore((state) => state.sendTextMessage);
  const sendMediaMessage = useChatStore((state) => state.sendMediaMessage);
  const isSendingMedia = useChatStore((state) => state.isSendingMedia);

  const fileInputRef = useRef(null);

  // Send text on Enter (but Shift+Enter adds a newline)
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage(conversationId);
    }
  }

  // When user picks a file from the file picker
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    sendMediaMessage({ conversationId, file });
    // Reset the file input so the same file can be sent again
    e.target.value = "";
  }

  const canSend = composerText.trim().length > 0 && !isSendingMedia;

  return (
    <div className="shrink-0 border-t border-border bg-background">
      {/* AI Smart Reply chips */}
      <SmartReplies messages={messages} onSelectReply={setComposerText} />

      <div className="flex items-end gap-2 rounded-2xl border border-border bg-foreground/3 mx-3 mb-3 px-3 py-2">
        {/* Hidden file input triggered by the image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isSendingMedia}
        />

        {/* Image/file upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSendingMedia}
          className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/8 hover:text-foreground disabled:opacity-40"
          aria-label="Attach image or video"
        >
          <ImagePlus className="h-4 w-4" />
        </button>

        {/* Text input */}
        <textarea
          rows={1}
          placeholder="Message…"
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSendingMedia}
          className="flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed outline-none placeholder:text-foreground/35 disabled:opacity-50"
          style={{ maxHeight: "120px", overflowY: "auto" }}
        />

        {/* Send button / uploading spinner */}
        <button
          onClick={() => sendTextMessage(conversationId)}
          disabled={!canSend}
          className={`mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
            canSend
              ? "bg-accent text-white shadow-sm hover:opacity-90"
              : "text-foreground/25"
          }`}
          aria-label="Send message"
        >
          {isSendingMedia ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

