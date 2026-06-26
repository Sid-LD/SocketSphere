import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

/**
 * useChatStore — the single source of truth for everything chat-related in the app.
 *
 * `create` from Zustand creates a global store (like Redux, but without boilerplate).
 * `persist` is a Zustand middleware that wraps the store so that certain pieces of
 * state survive a page refresh by automatically saving them to localStorage.
 *
 * Why persist only `isSoundEnabled`?
 *   → Because it's a user preference. Messages, conversations, and selected users
 *     should always be fetched fresh from the server — stale cached data would cause bugs.
 */
export const useChatStore = create(
  persist(
    // `set`  → function to update state (like setState in React)
    // `get`  → function to READ the current state from inside the store itself
    //          (you need `get` because inside actions, `state` isn't directly accessible
    //           the way it is in React components — you have to call get() to grab it)
    (set, get) => ({
      // ─────────────────────────────────────────────────────────────
      //  STATE VARIABLES
      // ─────────────────────────────────────────────────────────────

      /**
       * users: []
       * All users that exist in the system (fetched from /messages/users).
       * Used to populate the "New Chat" / People tab — the list of everyone
       * you CAN start a conversation with, not just people you've already chatted with.
       *
       * Shape of each user object:
       * { _id, fullName, profilePic, email }
       */
      users: [],

      /**
       * conversations: []
       * Only the users you have ALREADY exchanged messages with.
       * Each entry is basically a user object enriched with lastMessage preview data.
       * This is what populates the "Chats" sidebar tab.
       *
       * Shape: { _id, fullName, profilePic, lastMessage, lastMessageTime }
       */
      conversations: [],

      /**
       * messages: []
       * The full message thread between YOU and the currently selected user.
       * Populated by getMessages(userId) and updated in real-time via Socket.io.
       *
       * Shape of each message:
       * { _id, text, image, senderId, receiverId, createdAt }
       */
      messages: [],

      /**
       * selectedUser: null
       * The user whose conversation is currently open in the chat window.
       * When null → no conversation is open (empty/placeholder state in ChatContainer).
       *
       * Shape: { _id, fullName, profilePic, email }
       */
      selectedUser: null,

      /**
       * isConversationsLoading: false
       * True while getConversations() is waiting for the API response.
       * Used to show a skeleton/spinner in the sidebar conversation list.
       */
      isConversationsLoading: false,

      /**
       * isUsersLoading: false
       * True while getUsers() is waiting for the API response.
       * Used to show a loading state in the "People" / "New Chat" tab.
       */
      isUsersLoading: false,

      /**
       * isMessagesLoading: false
       * True while getMessages(userId) is waiting for the API response.
       * Used to show a spinner/skeleton inside the ChatContainer message area.
       */
      isMessagesLoading: false,

      /**
       * activeConversationId: null
       * The _id of the conversation (= the OTHER user's _id) that is currently open.
       * Kept separately from selectedUser so that even if selectedUser gets reset
       * (e.g. during a users refresh), we can re-derive it.
       *
       * This is the "source of truth" ID — selectedUser is derived from it.
       */
      activeConversationId: null,

      /**
       * searchQuery: ""
       * Whatever the user has typed into the sidebar search box.
       * Used to filter conversations or users in the UI (client-side filter, no API call).
       */
      searchQuery: "",

      /**
       * sidebarTab: "chats"
       * Which tab is active in the left sidebar — "chats" or "people".
       * "chats"  → shows conversations list (people you've already talked to)
       * "people" → shows all users list (everyone you can talk to)
       */
      sidebarTab: "chats",

      /**
       * composerText: ""
       * The live text value inside the message input box (the composer/text area).
       * Controlled here (not in local component state) so that:
       *   1. sendTextMessage() can read it directly from the store.
       *   2. sendMessage() can clear it (set to "") after a successful send.
       *   3. It persists if the user switches tabs and comes back (optional UX benefit).
       */
      composerText: "",

      /**
       * isSoundEnabled: true
       * Whether notification sounds play when a new message arrives.
       * This is the only piece of state saved to localStorage (via `partialize` below),
       * because it's a user preference that should survive page reloads.
       */
      isSoundEnabled: true,

      /**
       * isSendingMedia: false
       * True ONLY while a file/image upload is in progress (sendMediaMessage is running).
       * Used to show a loading indicator in the composer so the user knows the upload
       * is happening and doesn't click send again.
       *
       * Flow:
       *   false → user selects a file → sendMediaMessage() fires → true
       *   → upload finishes (success or error) → false again (via finally block)
       */
      isSendingMedia: false,

      // ─────────────────────────────────────────────────────────────
      //  ACTIONS (functions that fetch data / update state)
      // ─────────────────────────────────────────────────────────────

      /**
       * getUsers()
       * Fetches the list of ALL users in the system from the backend.
       * Also safely re-validates `selectedUser` — if the currently selected user
       * somehow disappeared from the users list, it resets selectedUser to null
       * (defensive programming to avoid showing a ghost/deleted user).
       *
       * Called when: the "People" tab is opened, or on app mount.
       */
      getUsers: async () => {
        // Immediately flip the loading flag so the UI can show a spinner
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");

          set((state) => ({
            users: res.data,

            /**
             * Re-validate selectedUser against the fresh users list.
             *
             * `state.selectedUser` → the user currently open in chat (could be stale).
             * `res.data.some(user => user._id === state.selectedUser._id)` →
             *   checks if that user still exists in the freshly fetched list.
             *
             * If selectedUser still exists in the new list → keep it as-is.
             * If selectedUser is gone (deleted account, etc.)  → reset to null.
             * If selectedUser was already null               → keep null.
             *
             * This ternary: `state.selectedUser && condition ? state.selectedUser : null`
             * short-circuits: if selectedUser is null, `state.selectedUser &&` is falsy
             * so we skip the .some() call entirely and just set null.
             */
            selectedUser:
              state.selectedUser &&
              res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          // Not showing a toast here — a silent log is intentional.
          // The users list failing to load isn't critical enough to interrupt the UX.
          console.log("Error in get Users", error.message);
        } finally {
          // Always runs — even if the try block threw — so the spinner always stops.
          set({ isUsersLoading: false });
        }
      },

      /**
       * getConversations()
       * Fetches the list of conversations (previous chats) for the logged-in user.
       * Unlike getUsers(), this only returns people you've actually messaged before,
       * along with a lastMessage preview for each — exactly what populates the sidebar.
       *
       * Called when: the app mounts, or after a new message is sent (to refresh previews).
       */
      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      /**
       * getMessages(userId)
       * Fetches the full message history between the logged-in user and `userId`.
       * Replaces whatever was in `messages` before (not appended — fully replaced).
       *
       * Called when: the user clicks on a conversation and ChatContainer mounts/updates.
       *
       * @param {string} userId — the _id of the other user in the conversation
       */
      getMessages: async (userId) => {
        // Guard: if no userId is passed somehow, abort immediately
        if (!userId) return;

        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          // This IS shown as a toast because failing to load messages is user-facing.
          toast.error(
            error.response?.data?.message || "Failed to load messages",
          );
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      /**
       * sendMessage(messageData)
       * The CORE send function — handles the actual API call to post a message.
       * Both sendTextMessage() and sendMediaMessage() are thin wrappers that call this.
       *
       * Why separate this?
       *   → So text and media sends share the same POST logic. Only the `messageData`
       *     payload differs (plain object for text, FormData for media).
       *
       * On success:
       *   1. Appends the newly created message to the local `messages` array
       *      (optimistic-style: we trust the server response, not a guess).
       *   2. Clears composerText ("") so the input box empties.
       *   3. Re-fetches conversations to update the sidebar's lastMessage preview.
       *   4. Returns `true` so callers know the send succeeded.
       *
       * On failure:
       *   → Shows an error toast and returns `false`.
       *
       * @param {Object|FormData} messageData — { text } OR a FormData with a "media" field
       * @returns {boolean} — true = success, false = failure
       */
      sendMessage: async (messageData) => {
        // Read current state — we need selectedUser to build the URL,
        // and messages to append to without losing existing ones.
        const { selectedUser, messages } = get();

        // Guard: can't send a message if no conversation is selected
        if (!selectedUser) return false;

        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData,
          );

          set({
            // Spread existing messages and tack the new message on at the end.
            // We use the server's response (res.data) — it has the real _id and timestamp.
            messages: [...messages, res.data],

            // Clear the composer input after a successful send
            composerText: "",
          });

          // Re-fetch conversations so the sidebar immediately shows the latest message preview
          get().getConversations();

          return true; // Signal to the caller: message was sent successfully
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to send message",
          );
          return false; // Signal to the caller: something went wrong
        }
      },

      /**
       * subscribeToMessages(userId)
       * Sets up a Socket.io listener so new incoming messages appear in real-time
       * without the user having to refresh. This is the live-update mechanism.
       *
       * How it works:
       *   1. Grabs the socket from useAuthStore (the socket is connected at login time).
       *   2. socket.off("newMessage") → removes any previously attached listener first.
       *      This is critical — without this, every time the user switches conversations,
       *      a NEW listener gets added on top of old ones (listener leak / duplicate messages).
       *   3. socket.on("newMessage", handler) → attaches a fresh listener.
       *   4. Inside the handler:
       *      - If the incoming message is NOT from `userId`, IGNORE it.
       *        (You don't want messages from other people bleeding into the open conversation.)
       *      - If it IS from `userId`, append it to messages and refresh conversations.
       *
       * Called when: ChatContainer mounts (i.e., user opens a conversation).
       *
       * @param {string} userId — the _id of the person we're currently chatting with
       */
      subscribeToMessages: (userId) => {
        // Guard: no userId means we don't know whose messages to listen for
        if (!userId) return;

        const socket = useAuthStore.getState().socket;

        // Guard: socket might not be initialised yet (edge case on slow connections)
        if (!socket) return;

        // Remove any existing "newMessage" listener before adding a new one.
        // Without this line, switching from chat A → chat B → chat A would attach
        // 3 listeners, causing triplicate messages to appear.
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
          /**
           * Filter check:
           * The server emits "newMessage" to EVERYONE in a room, but we only want to
           * display it if it's from the person whose chat is currently open (userId).
           *
           * `String(...)` is used to ensure both sides are plain strings before comparing
           * (MongoDB ObjectIds can come back as objects in some serialisation paths).
           *
           * If it's NOT from the currently open user → return early, do nothing.
           */
          if (String(newMessage.senderId) !== String(userId)) return;

          // Append the new message to the end of the current messages array
          set({ messages: [...get().messages, newMessage] });

          // Also refresh the conversations list so the sidebar preview updates instantly
          get().getConversations();
        });
      },

      /**
       * unsubscribeFromMessages()
       * Removes the "newMessage" Socket.io listener.
       *
       * Called when: ChatContainer unmounts (user closes the conversation / navigates away).
       * This is cleanup — without it, the listener keeps firing even with no active chat open,
       * which wastes memory and can trigger stale state updates.
       */
      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        // Optional chaining (?.) handles the case where socket is null/undefined
        socket?.off("newMessage");
      },

      /**
       * setSelectedUser(selectedUser)
       * Simple setter — directly sets the selectedUser in the store.
       * Exposed so components can update who is currently "selected"
       * without having to go through the full setActiveConversationId flow.
       *
       * @param {Object|null} selectedUser
       */
      setSelectedUser: (selectedUser) => set({ selectedUser }),

      /**
       * setActiveConversationId(activeConversationId)
       * The "smart" conversation opener — does three things atomically in one set() call:
       *
       *   1. Updates `activeConversationId` to the new ID.
       *
       *   2. Derives `selectedUser` from the ID:
       *      - First looks in `users` (the "People" tab data).
       *      - Falls back to `conversations` (the "Chats" tab data).
       *      - If not found in either → null.
       *      Why look in two places? Because a user could be in one list but not the other
       *      (e.g., you started a new chat from People tab — they're in users but not yet
       *       in conversations because you haven't sent a message yet).
       *
       *   3. Clears `messages` if the new ID is null (conversation is being closed).
       *      If a real conversation is being opened, messages are NOT cleared here —
       *      getMessages(userId) will overwrite them anyway after this call.
       *
       * Called when: user clicks on a conversation in the sidebar.
       *
       * @param {string|null} activeConversationId
       */
      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,

          // Try to resolve the user object from either list
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find(
              (user) => user._id === activeConversationId,
            ) ||
            null,

          // If closing the conversation (null), wipe messages so the empty state shows.
          // If opening a conversation, keep messages temporarily (until getMessages refreshes them).
          messages: activeConversationId ? state.messages : [],
        }));
      },

      // ─────────────────────────────────────────────────────────────
      //  SIMPLE SETTERS
      //  These are trivial — just wrappers around set() — but they
      //  exist so components never call set() directly (encapsulation).
      //  Always use these from components instead of mutating state directly.
      // ─────────────────────────────────────────────────────────────

      /** Updates the search query string (used to filter sidebar list) */
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      /** Switches the active sidebar tab: "chats" | "people" */
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),

      /** Syncs the message composer input value into the store */
      setComposerText: (composerText) => set({ composerText }),

      /** Toggles notification sounds on/off (persisted to localStorage) */
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      // ─────────────────────────────────────────────────────────────
      //  SPECIALISED SEND HELPERS
      //  Thin wrappers around sendMessage() — add type-specific logic
      //  (validation, FormData construction, loading flags) before
      //  delegating to the core sendMessage() function.
      // ─────────────────────────────────────────────────────────────

      /**
       * sendTextMessage(conversationId)
       * Sends whatever is currently in composerText as a plain text message.
       *
       * Why does it read composerText from the store instead of taking it as a param?
       *   → So the component just calls sendTextMessage(id) and doesn't need to
       *     extract and pass the text itself. The store owns composerText, so the
       *     store reads it. Keeps component code simpler.
       *
       * The .trim() ensures a message of just spaces/newlines is treated as empty.
       *
       * @param {string} conversationId — the _id of the open conversation (= selectedUser._id)
       * @returns {boolean}
       */
      sendTextMessage: async (conversationId) => {
        // Read and clean composerText from current state
        const messageText = get().composerText.trim();

        // Guard: need both a conversation ID and non-empty text
        if (!conversationId || !messageText) return false;

        // Delegate to sendMessage with a plain text payload
        return get().sendMessage({ text: messageText });
      },

      /**
       * sendMediaMessage({ conversationId, file })
       * Sends a file (image, video, etc.) as a message.
       *
       * Why FormData?
       *   → File uploads need multipart/form-data encoding so the binary file data
       *     is transmitted correctly. A plain JSON body can't carry raw file bytes.
       *   → axiosInstance (configured with appropriate headers) handles the rest.
       *
       * isSendingMedia flag:
       *   → Set to true BEFORE the upload, false in the `finally` block.
       *   → `finally` guarantees it resets even if sendMessage() throws.
       *   → The UI watches this flag to disable the composer / show a spinner.
       *
       * @param {{ conversationId: string, file: File }} param
       * @returns {boolean}
       */
      sendMediaMessage: async ({ conversationId, file }) => {
        // Guard: need both a target conversation and an actual file
        if (!conversationId || !file) return false;

        // Build FormData — key "media" must match what the backend's multer expects
        const formData = new FormData();
        formData.append("media", file);

        // Signal that upload is in progress (disables send button, shows spinner, etc.)
        set({ isSendingMedia: true });
        try {
          // Delegate to sendMessage with FormData instead of a plain object
          return await get().sendMessage(formData);
        } finally {
          // Always reset, whether sendMessage succeeded or threw
          set({ isSendingMedia: false });
        }
      },
    }),

    // ─────────────────────────────────────────────────────────────
    //  PERSIST CONFIG
    // ─────────────────────────────────────────────────────────────
    {
      /**
       * name: the localStorage key under which persisted state is saved.
       * Open DevTools → Application → Local Storage to see it.
       */
      name: "imessage-storage",

      /**
       * partialize: a function that receives the full state and returns
       * ONLY the slice you want to persist to localStorage.
       *
       * Here we persist ONLY `isSoundEnabled` — the user's sound preference.
       * Everything else (messages, users, selectedUser, etc.) is intentionally
       * excluded: it should always be fetched fresh from the server on reload,
       * not loaded from a potentially stale localStorage snapshot.
       */
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);
