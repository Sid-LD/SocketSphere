import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  //introduction of state variables
  users: [],
  /*   [
  { _id: "user1", name: "Alice", avatar: "url", email: "alice@..." },
  { _id: "user2", name: "Bob", avatar: "url", email: "bob@..." }
]*/

  conversations: [],
  /*   [
  {
    _id: "conv1",
    userId: "user1",
    userName: "Alice",
    userAvatar: "url",
    lastMessage: "See you tomorrow!",
    lastMessageTime: "2024-06-26T10:30:00Z"
  },
  {
    _id: "conv2",
    userId: "user2",
    userName: "Bob",
    userAvatar: "url",
    lastMessage: "Thanks!",
    lastMessageTime: "2024-06-26T09:15:00Z"
  }
]*/

  messages: [],
  /*   [
  {
    _id: "msg1",
    text: "Hi there!",
    senderId: "user1",
    receiverId: "currentUserId",
    timestamp: "2024-06-26T10:00:00Z",
    image: null
  },
  {
    _id: "msg2",
    text: "",
    senderId: "currentUserId",
    receiverId: "user1",
    timestamp: "2024-06-26T10:05:00Z",
    image: "image_url"
  }
]*/

  selectedUser: null,
  /* selectedUser: {
    _id: "user1",
    name: "Alice",
    avatar: "url",
    email: "alice@...",
  },*/

  activeConversationId: null, // Stores the ID of the currently opened/active conversation

  searchQuery: "", // Stores the user's search input for filtering conversations or users

  sidebarTab: "chats", //Tracks which tab is active in the

  composerText: "", //: Stores the text the user is currently typing in the message input box

  isSoundEnabled:true,

  isConversationLoading:false,

  isUserLoading:false,

  isMessageLoading:false,//ek particular user ke liye sare messages load kar pa rhe ho ki nhi

  isSendingMedia:false,
  //FLOW
  //isSendingMedia:false-> user selects a file and clicks on upload button->immediately isSendingMedia:true->file uploaded to the server and the sender receives it->isSendingMedia:true

  
  

}));