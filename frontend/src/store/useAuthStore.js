import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  hasCheckedAuth: false,

  checkAuth: async () => {
    const { hasCheckedAuth } = get();
    if (hasCheckedAuth) return;

    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, hasCheckedAuth: true });
      if (res.data) {
        get().connectSocket();
        console.log("socket connected after checkauth to the user:", res.data._id);
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null, hasCheckedAuth: true });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      if (res.data) {
        get().connectSocket();
        console.log("socket connected after signup to the user:", res.data._id);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      if (res.data) {
        get().connectSocket();
        console.log("socket connected after login to the user:", res.data._id);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null, hasCheckedAuth: false });
      toast.success("Logged out successfully");
    } catch (err) {
      console.log("logout error", err);
      toast.error("Logout failed: " + err.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    
    // Don't connect if no user or socket already exists
    if (!authUser || socket?.connected) {
      return;
    }

    console.log("Connecting socket for user:", authUser._id);
    const newSocket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      // Emit setup event with user ID
      newSocket.emit("setup", authUser._id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    set({ socket: newSocket });
    //listening for online users
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users:", userIds);
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log("Disconnecting socket");
      socket.disconnect();
      set({ socket: null });
    }
  }
}));