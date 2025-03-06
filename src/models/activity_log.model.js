import mongoose from "mongoose";

const { Schema } = mongoose;

const activityLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    affected_userId: {
        type: String,
    },
    old_data: { type: Schema.Types.Mixed },
    new_data: { type: Schema.Types.Mixed },
    roleName: { type: String },
    timestamp: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
