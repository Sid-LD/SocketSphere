import { ArrowLeftIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

// ─── ChatHeader ───────────────────────────────────────────────────────────────
// Shows the selected user's avatar, name, and online status at the top of the
// message panel. Also has a back button on mobile (hides the chat, shows sidebar).

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ChatHeader({ peer }) {
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  if (!peer) return null;

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
      {/* Back button — visible only on mobile (below lg breakpoint) */}
      <button
        onClick={() => setActiveConversationId(null)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-foreground/8 lg:hidden"
        aria-label="Back to contacts"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>

      {/* Avatar */}
      <div className="relative shrink-0">
        {peer.avatarUrl ? (
          <img
            src={peer.avatarUrl}
            alt={peer.name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            {getInitials(peer.name)}
          </div>
        )}
        {peer.isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
        )}
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{peer.name}</p>
        <p className="text-xs text-foreground/50">
          {peer.isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </header>
  );
}
