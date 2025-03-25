import mongoose from "mongoose";

const { Schema } = mongoose;

const salarySchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    total_salary: { type: Number, required: true },
    payment_date: { type: Date, required: true },
    description: { type: String },
});

const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
