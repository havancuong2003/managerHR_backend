import mongoose from "mongoose";

const { Schema } = mongoose;

const activityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
