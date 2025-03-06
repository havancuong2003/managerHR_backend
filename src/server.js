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
import positionRoute from "./routes/position.route.js";
import employeeRoute from "./routes/employee.route.js";
import departmentRoute from "./routes/department.route.js";
import activityLogRoute from "./routes/activitie_log.route.js";

dotenv.config();

const app = express();

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: process.env.CLIENT_URL, // URL Frontend
        credentials: true, // Cho phép gửi cookie qua request
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/positions", positionRoute);
app.use("/api/employees", employeeRoute);
app.use("/api/departments", departmentRoute);
app.use("/api/activity_logs", activityLogRoute);
const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
    dbConnect();
    console.log(`Server running on http://${HOST}:${PORT}`);
});
