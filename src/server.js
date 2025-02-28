import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import dbConnect from "./config/dbConnect.js";
import authRoute from "./routes/auth.route.js";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
    dbConnect();
    console.log(`Server running on http://${HOST}:${PORT}`);
});
