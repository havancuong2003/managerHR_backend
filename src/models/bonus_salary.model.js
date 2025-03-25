import mongoose from "mongoose";

const { Schema } = mongoose;

const bonusSalarySchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bonus_salary: { type: Number, required: true },
    description: { type: String },
    payment_date: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

const BonusSalary = mongoose.model("BonusSalary", bonusSalarySchema);

export default BonusSalary;
