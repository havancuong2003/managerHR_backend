import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ["present", "absent", "late"],
        required: true,
    },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
