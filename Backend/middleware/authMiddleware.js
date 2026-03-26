import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "No token, not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: "Token failed" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin only" });
    }
    next();
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ 
                message: `Role ${req.user?.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

export const isAdminOrWarden = (req, res, next) => {
    const allowedRoles = ["admin", "warden", "chief-warden"];
    if (!allowedRoles.includes(req.user?.role)) {
        return res.status(403).json({ message: "Admin or Warden access required" });
    }
    next();
};