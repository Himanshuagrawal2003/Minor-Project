import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import messRoutes from "./routes/messRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";

// 🔥 Load env first
dotenv.config();

// 🔥 Debug logs (important)
console.log("ENV PORT:", process.env.PORT);

// 🔥 Connect DB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

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

app.get("/", (req, res) => {
    res.send("API Running...");
});

// 🔥 FIX: fallback port
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
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});