import mongoose from "mongoose";

const { Schema } = mongoose;

const positionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
});

const Position = mongoose.model("Position", positionSchema);

export default Position;
