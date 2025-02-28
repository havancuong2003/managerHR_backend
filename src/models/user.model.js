import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        dob: { type: String, required: true },
        gender: { type: String, enum: ["Nam", "Nữ"], required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        department: { type: String, required: true },
        position: { type: String, required: true },
        salary: { type: Number, required: true },
        startDate: { type: String, required: true },
        password: { type: String, required: true },
        avatarUrl: { type: String },
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
