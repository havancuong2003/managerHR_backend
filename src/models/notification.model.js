import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    receiver: {
        all: { type: Boolean, default: false },
        department: { type: [Schema.Types.ObjectId], ref: "Department" },
        employees: { type: [Schema.Types.ObjectId], ref: "User" },
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
