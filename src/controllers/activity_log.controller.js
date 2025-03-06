import fs from "fs";
import path from "path";
import ActivityLog from "../models/activity_log.model.js";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import User from "../models/user.model.js";
// Thêm những dòng này để thay thế __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllActivityLogs = async (req, res) => {
    try {
        const activityLogs = await ActivityLog.find();
        const sanitizedLogs = await Promise.all(
            activityLogs.map(async (log) => {
                const user = await User.findById(log.userId);
                const userPhone = user ? user.phone : "user not found";
                const affectedUser = await User.findById(log.affected_userId);
                const affectedUserPhone = affectedUser
                    ? affectedUser.phone
                    : "User not found";

                const timeFormat = new Date(log.timestamp).toLocaleString(
                    "en-GB",
                    { hour12: false }
                );
                return {
                    ID: log._id.toString(),
                    action: log.action,
                    userPhone: userPhone,
                    affected_userPhone: affectedUserPhone,
                    roleName: log.roleName,
                    timestamp: timeFormat, // Timestamp from MongoDB
                    old_data: log.old_data,
                    new_data: log.new_data,
                };
            })
        );

        console.log("check sanitized activity logs", sanitizedLogs);
        res.status(200).json(sanitizedLogs);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: error.message });
    }
};

export const downloadActivityLogs = async (req, res) => {
    try {
        const { startDate, endDate } = req.body.data;
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const logs = await ActivityLog.find({
            timestamp: { $gte: start, $lte: end },
        });

        const processActivityLogs = logs.map((log) => ({
            ID: log._id.toString(),
            action: log.action,
            userId: log.userId ? log.userId.toString() : "N/A",
            affected_userId: log.affected_userId
                ? log.affected_userId.toString()
                : "N/A",
            roleName: log.roleName || "N/A",
            timestamp: log.timestamp,
        }));

        // Chuyển dữ liệu thành Excel
        const ws = XLSX.utils.json_to_sheet(processActivityLogs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees");

        // Tạo tên file với timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `employees_backup_${timestamp}.xlsx`;
        const filePath = path.join(__dirname, "..", "..", "temp", fileName);

        // Đảm bảo thư mục temp tồn tại
        const tempDir = path.join(__dirname, "..", "..", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Ghi file Excel
        XLSX.writeFile(wb, filePath);

        // Trả về file cho người dùng tải về
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Failed to download file");
            }
            // Xoá file sau khi gửi
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
            });
        });
    } catch (error) {
        console.error("Error fetching activity logs: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
