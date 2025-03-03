import mongoose from "mongoose";
import User from "./User.js"; // Import the User model for reference

const { Schema } = mongoose;

const departmentSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
