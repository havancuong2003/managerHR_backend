import express from "express";
import {
    checkInAttendance,
    checkOutAttendance,
    getAttendanceByEmployee,
    getAttendanceReportByMonth,
    getCheckInAttendance,
    getDepartmentIdForManager,
} from "../controllers/attendance.controller.js";
import {
    authMiddleware,
    roleMiddleware,
    positionMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

// Route để check-in attendance
router.post("/check-in/:id", authMiddleware, checkInAttendance);

// Route để check-out attendance
router.post("/check-out/:id", authMiddleware, checkOutAttendance);

// Route để lấy attendance của một nhân viên theo employeeId
router.post("/employee/:id", authMiddleware, getAttendanceByEmployee);

// Route để lấy báo cáo attendance theo tháng cho một department
router.post(
    "/department/:departmentId/report",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getAttendanceReportByMonth
);
router.get("/getCheckIn/:id", authMiddleware, getCheckInAttendance);
router.get("/getDepartmentId/:id", authMiddleware, getDepartmentIdForManager);

export default router;
