import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        number: { 
            type: String, 
            required: true, 
            unique: true 
        },
        block: { 
            type: String, 
            required: true 
        },
        capacity: { 
            type: Number, 
            required: true,
            default: 3
        },
        type: {
            type: String,
            enum: ["Boys", "Girls"],
            default: "Boys"
        },
        status: {
            type: String,
            enum: ["Available", "Full", "Maintenance"],
            default: "Available"
        }
    },
    { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
