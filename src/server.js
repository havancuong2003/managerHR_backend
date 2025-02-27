import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import morgan from "morgan";

import dbConnect from "./config/dbConnect.js";
import authRoute from "./routes/auth.route.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
    dbConnect();
    console.log(`Server running on http://${HOST}:${PORT}`);
});
