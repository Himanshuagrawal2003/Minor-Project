import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import http from "http";

import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { initSocket } from "./utils/socket.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

console.log("ENV PORT:", process.env.PORT);

connectDB();

const app = express();
const server = http.createServer(app);

// 1. IMPORTANT: CORS must be handled for Express
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));

// 2. Initialize Socket.io AFTER CORS middleware
initSocket(server);

app.use(morgan("dev"));
app.use(express.json());

// Set up static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
const noticesDir = path.join(uploadsDir, "notices");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(noticesDir)) fs.mkdirSync(noticesDir);

app.use("/uploads", express.static(uploadsDir));


// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/mess", messRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("API Running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({ 
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;

// 🔥 START SERVER
server.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});