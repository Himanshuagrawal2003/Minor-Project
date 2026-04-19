import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        customId: { type: String, unique: true, sparse: true },
        email: {
            type: String,
            unique: true,
            sparse: true,
            required: [true, "Email is required"],
        },

        contact: {
            type: String,
            required: [true, "Contact number is required"],
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v);
                },
                message: props => `${props.value} is not a valid 10-digit phone number!`
            }
        },

        role: {
            type: String,
            enum: ["student", "warden", "chief-warden", "staff", "admin"],
            required: true,
        },

        password: { type: String, required: true },

        isProfileComplete: { type: Boolean, default: false },
        roomNumber: { type: String, default: "" },
        block: { type: String, default: "" },
        buildingType: { 
            type: String, 
            enum: ["Boys", "Girls", ""],
            default: ""
        },
        roomId: { type: String, default: "" },
        messId: { type: String, default: "" },
        course: { type: String, default: "" },
        department: { type: String, default: "" },
        address: { type: String, default: "" },
        bio: { type: String, default: "" },
    },
    { timestamps: true }
);


// 🔥 PASSWORD HASH (SAVE SE PEHLE)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// 🔥 PASSWORD MATCH FUNCTION
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


export default mongoose.model("User", userSchema);