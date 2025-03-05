import mongoose from "mongoose";

const { Schema } = mongoose;

const leaveRequestSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    leave_reason: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        required: true,
    },
    manager_reason: { type: String }, // Admin can add reason for approval/denial
});

const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequest;
