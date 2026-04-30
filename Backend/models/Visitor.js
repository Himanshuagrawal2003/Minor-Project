import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        phone: { 
            type: String, 
            required: [true, "Phone number is required"],
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid 10-digit phone number!`
            }
        },
        college: { type: String },
        year: { type: String },
        preferredRoomType: { type: String },
        inquiryDate: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['pending', 'contacted', 'allotted', 'cancelled'], 
            default: 'pending' 
        },
        notes: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);
