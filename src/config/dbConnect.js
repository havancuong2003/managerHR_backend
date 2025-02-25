import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log("Database connected");
        });
    } catch (error) {
        console.log(error);
    }
};

export default dbConnect;
