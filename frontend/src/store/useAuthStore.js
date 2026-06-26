import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const baseURL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // When app tries to log in
  checkAuth: async () => {
    set((state) => ({
      isCheckingAuth: true,
    }));

    try {
      // Checking if the user is logged in or not by asking the backend server
      const res = await axiosInstance.get("/auth/check");

      set((state) => ({
        authUser: res.data,
      }));

      get().connectSocket(res.data)

    } catch (error) {
      console.error("Error in checking auth", error.message);

      set((state) => ({
        authUser: null,
      }));
    } finally {
      set((state) => ({
        isCheckingAuth: false,
      }));
    }
  },

  // when the user tries to log out
  clearAuth: () => {
    set((state) => ({
      authUser: null,
      onlineUsers: [],
      isCheckingAuth: false,
    }));
    get().disconnectSocket()
  },

  connectSocket: (user) => {
    if (!user || get().socket?.connected) return;

    // This immediately tries to connect to the Socket.IO server
    const socket = io(baseURL, {
      query: { userId: user._id },
    });

    set((state) => ({
      socket: socket,
    }));

    socket.on("getOnlineUsers", (userIds) => {
      set((state) => ({
        onlineUsers: userIds,
      }));
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket?.connected) {
      socket.disconnect();
    }

    set((state) => ({
      socket: null,
    }));
  },
}));
