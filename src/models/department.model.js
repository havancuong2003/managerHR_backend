import mongoose from "mongoose";

const { Schema } = mongoose;

const departmentSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
