import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import ChatSidebar from "../components/chat/ChatSideBar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import ChatComposer from "../components/chat/ChatComposer";
import { MessageSquareDashed } from "lucide-react";

// ─── ChatPage ────────────────────────────────────────────────────────────────
// The main chat screen. It has two panels side by side:
//   LEFT  → ChatSidebar (contact list)
//   RIGHT → Chat panel (header + message thread + composer)
//
// On mobile, only one panel is visible at a time:
//   - No conversation selected → show sidebar
//   - Conversation selected    → show chat panel (sidebar hides)

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-foreground/40">
      <MessageSquareDashed className="h-12 w-12 opacity-30" />
      <p className="text-sm font-medium">Select a conversation</p>
      <p className="text-xs">Choose a contact from the sidebar to start chatting</p>
    </div>
  );
}

function ChatPage() {
  const getConversations = useChatStore((state) => state.getConversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);

  const { activeConversation, activeConversationId, isLargeScreen } =
    useSelectedConversation();

  // Fetch users and conversations on mount
  useEffect(() => {
    getUsers();
    getConversations();
  }, [getConversations, getUsers]);

  // Fetch messages + subscribe to real-time updates when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    getMessages(activeConversationId);
    subscribeToMessages(activeConversationId);

    // Cleanup: remove socket listener when conversation closes
    return () => unsubscribeFromMessages();
  }, [getMessages, activeConversationId, subscribeToMessages, unsubscribeFromMessages]);

  // On mobile: show sidebar OR chat panel, not both
  // On large screens: show both side-by-side
  const showSidebar = isLargeScreen || !activeConversationId;
  const showChat = isLargeScreen || !!activeConversationId;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* ── LEFT: Sidebar ─────────────────────────────────── */}
      {showSidebar && <ChatSidebar />}

      {/* ── RIGHT: Chat panel ─────────────────────────────── */}
      {showChat && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {activeConversation ? (
            <>
              {/* Top bar with user info */}
              <ChatHeader peer={activeConversation.peer} />

              {/* Scrollable message thread */}
              <MessageList
                messages={activeConversation.messages}
                conversationId={activeConversationId}
              />

              {/* Text input + send */}
              <ChatComposer conversationId={activeConversationId} />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </div>
  );
}

export default ChatPage;
