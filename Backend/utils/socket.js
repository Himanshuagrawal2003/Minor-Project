import { Server } from "socket.io";
import Notification from "../models/Notification.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URLs
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io/"
  });

  io.on("connection", (socket) => {
    console.log(`🔌 New Connection: ${socket.id}`);

    // Join a room based on userId for private notifications
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    // Join role-based rooms (e.g., 'warden', 'admin')
    socket.on("joinRole", (role) => {
      socket.join(role);
      console.log(`👤 User ${socket.id} joined ROLE room: ${role}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

/**
 * Send notification to a specific user or group
 * @param {Object} data - Notification data
 * @param {string} data.recipient - User ID or Role (warden/admin/student)
 * @param {string} data.type - Notification type
 * @param {string} data.title - Title
 * @param {string} data.message - Message
 * @param {string} data.link - Optional link
 */
export const sendNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    // 1. Save to database if it's for a specific user
    // (If recipient is a role like 'warden', we might need to handle it differently 
    // but for now let's assume it's a userId or we handle roles separately)
    
    // 1. Save to database only if recipient is a valid User ID (ObjectId)
    // For roles like 'student', 'warden', etc., we just emit the real-time event
    const isRole = ['student', 'warden', 'admin', 'staff', 'chief-warden'].includes(recipient);
    
    let notification;
    if (!isRole) {
       notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        link
      });
    }

    // 2. Emit real-time event
    const io = getIO();
    console.log(`📢 Emitting notification to room: ${recipient} | Title: ${title}`);
    
    io.to(recipient).emit("notification", {
      _id: notification?._id,
      type,
      title,
      message,
      link,
      createdAt: new Date(),
      isRead: false
    });

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
