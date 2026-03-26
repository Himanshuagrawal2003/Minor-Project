import Room from "../models/Room.js";

// ✅ GET ALL ROOMS
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ number: 1 });
        res.json({ rooms });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ CREATE ROOM (Admin only)
export const createRoom = async (req, res) => {
    try {
        const { number, block, capacity, type } = req.body;
        
        const roomExists = await Room.findOne({ number });
        if (roomExists) {
            return res.status(400).json({ message: "Room already exists" });
        }

        const room = await Room.create({ number, block, capacity, type });
        res.status(201).json({ success: true, room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ BULK CREATE ROOMS
export const bulkCreateRooms = async (req, res) => {
    try {
        const { rooms } = req.body;
        const result = await Room.insertMany(rooms);
        res.status(201).json({ success: true, count: result.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ UPDATE ROOM
export const updateRoom = async (req, res) => {
    try {
        const { number, block, capacity, type, status } = req.body;
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { number, block, capacity, type, status },
            { new: true }
        );
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.json({ success: true, room });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ DELETE ROOM
export const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: "Room not found" });
        res.json({ success: true, message: "Room deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
