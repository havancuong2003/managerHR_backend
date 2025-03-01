import mongoose from "mongoose";

const { Schema } = mongoose;

const backupSchema = new Schema({
    data: { type: Schema.Types.Mixed, required: true }, // The backup data
    backup_date: { type: Date, default: Date.now },
    restored: { type: Boolean, default: false },
});

const Backup = mongoose.model("Backup", backupSchema);

export default Backup;
