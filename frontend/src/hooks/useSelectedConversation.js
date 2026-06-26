
import { useSyncExternalStore } from "react";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// mapUserToConversation is an adapter — it converts the raw backend shapes
// (a user document + an array of message documents) into the clean view-model
// that the chat UI components expect to render.
function mapUserToConversation({ user, messages, authUser, onlineUsers }) {
  const mappedMessages = messages.map((message) => ({
    id: message._id,
    role: String(message.senderId) === String(authUser?._id) ? "me" : "them",
    text: message.text || "",
    time: formatMessageTime(message.createdAt),
    imageUrl: message.image,
    videoUrl: message.video,
  }));

  return {
    id: user._id,
    peer: {
      name: user.fullName,
      subtitle: user.email,
      isOnline: onlineUsers.includes(user._id),
      avatarUrl: user.profilePic,
    },
    messages: mappedMessages,
  };
}

// useSyncExternalStore lets us read window.innerWidth in a React-safe way.
// Returns true when the viewport is >= 1024px (lg breakpoint = "large screen").
function getIsLargeScreen() {
  return window.innerWidth >= 1024;
}
function subscribeToResize(cb) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

export function useSelectedConversation() {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const conversations = useChatStore((state) => state.conversations);
  const users = useChatStore((state) => state.users);
  const messages = useChatStore((state) => state.messages);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  // Reactive window-width check — re-renders when screen crosses 1024px
  const isLargeScreen = useSyncExternalStore(
    subscribeToResize,
    getIsLargeScreen,
    () => true, // server snapshot (SSR fallback)
  );

  const selectedUser = activeConversationId
    ? users.find((user) => user._id === activeConversationId) ||
      conversations.find((user) => user._id === activeConversationId)
    : null;

  const activeConversation = selectedUser
    ? mapUserToConversation({
        user: selectedUser,
        messages,
        authUser,
        onlineUsers,
      })
    : null;

  return {
    activeConversation,
    activeConversationId,
    isLargeScreen,
  };
}

