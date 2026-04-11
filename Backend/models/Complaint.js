import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ["Electrical", "Plumbing", "Internet", "Cleanliness", "Furniture", "Security", "Mess", "Water", "Other"],
        },
        priority: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
        },
        status: {
            type: String,
            required: true,
            enum: ["Pending", "In Progress", "Escalated", "Resolved", "Rejected"],
            default: "Pending",
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        studentName: { type: String, required: true },
        room: { type: String, required: true },
        block: { type: String, required: true }, // Added block for hostel-wise filtering
        assignedStaffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        remarks: { type: String },
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
