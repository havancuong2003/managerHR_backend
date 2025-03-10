import express from "express";
import {
    checkInAttendance,
    checkOutAttendance,
    getAttendanceByEmployee,
    getAttendanceReportByMonth,
} from "../controllers/attendance.controller.js";

const router = express.Router();

// Route để check-in attendance
router.post("/check-in/:id", checkInAttendance);

// Route để check-out attendance
router.post("/check-out/:id", checkOutAttendance);

// Route để lấy attendance của một nhân viên theo employeeId
router.post("/employee/:id", getAttendanceByEmployee);

// Route để lấy báo cáo attendance theo tháng cho một department
router.post("/department/:departmentId/report", getAttendanceReportByMonth);

export default router;
