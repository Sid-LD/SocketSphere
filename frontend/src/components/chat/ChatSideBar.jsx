import { UserButton } from "@clerk/react";
import { MessageSquare, Users, Search } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

// Returns first two initials from a full name — e.g. "John Doe" → "JD"
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// A single row in the contact list
function ContactRow({ user, isActive, isOnline, lastMessage, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        isActive ? "bg-accent/15" : "hover:bg-white/5"
      }`}
    >
      {/* Avatar with online dot */}
      <div className="relative shrink-0">
        {user.profilePic ? (
          <img src={user.profilePic} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            {getInitials(user.fullName)}
          </div>
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
        )}
      </div>

      {/* Name + last message */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.fullName}</p>
        {lastMessage && <p className="truncate text-xs text-foreground/50">{lastMessage}</p>}
      </div>
    </button>
  );
}

// ChatSidebar — left panel showing your contacts and conversations
export default function ChatSidebar() {
  const sidebarTab       = useChatStore((s) => s.sidebarTab);
  const setSidebarTab    = useChatStore((s) => s.setSidebarTab);
  const searchQuery      = useChatStore((s) => s.searchQuery);
  const setSearchQuery   = useChatStore((s) => s.setSearchQuery);
  const activeId         = useChatStore((s) => s.activeConversationId);
  const setActiveId      = useChatStore((s) => s.setActiveConversationId);
  const conversations    = useChatStore((s) => s.conversations);
  const users            = useChatStore((s) => s.users);
  const isLoading        = useChatStore((s) =>
    sidebarTab === "chats" ? s.isConversationsLoading : s.isUsersLoading
  );
  const onlineUsers      = useAuthStore((s) => s.onlineUsers);

  // Filter the current list by the search query (client-side, no extra API call)
  const q = searchQuery.toLowerCase();
  const list = (sidebarTab === "chats" ? conversations : users).filter((u) =>
    u.fullName.toLowerCase().includes(q)
  );

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-background">

      {/* Header — app name + Clerk profile button */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-bold">SocketSphere</span>
        <UserButton afterSignOutUrl="/auth" />
      </div>

      {/* Tab switcher — Chats | People */}
      <div className="flex gap-1 border-b border-border px-3 py-2">
        {["chats", "people"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSidebarTab(tab)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
              sidebarTab === tab ? "bg-accent/15 text-accent" : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {tab === "chats" ? <MessageSquare className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Search box */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-foreground/40" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>
      </div>

      {/* Contact / conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {isLoading ? (
          // Skeleton while loading
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-foreground/10" />
                <div className="h-2.5 w-1/2 animate-pulse rounded bg-foreground/10" />
              </div>
            </div>
          ))
        ) : list.length === 0 ? (
          <p className="p-4 text-center text-xs text-foreground/40">
            {sidebarTab === "chats" ? "No conversations yet. Go to People to start one." : "No users found."}
          </p>
        ) : (
          <div className="space-y-0.5">
            {list.map((user) => (
              <ContactRow
                key={user._id}
                user={user}
                isActive={activeId === user._id}
                isOnline={onlineUsers.includes(user._id)}
                lastMessage={user.lastMessage}
                onClick={() => setActiveId(user._id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}