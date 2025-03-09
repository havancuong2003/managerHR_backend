import express from "express";
import {
    createLeaveRequest,
    updateLeaveRequest,
    getRemainingLeaveDays,
    getPendingLeaveRequestsForManager,
    getLeaveRequestHistoryForEmployee,
    getLeaveRequestHistoryForManager,
} from "../controllers/leave_request.controller.js";

const router = express.Router();

// Route để tạo leave request
router.post("/create", createLeaveRequest);

// Route để cập nhật leave request
router.put("/update", updateLeaveRequest);

// Route để lấy số ngày nghỉ phép còn lại của nhân viên
router.get(
    "/remaining-leave-days/:employeeId/:year/:month",
    getRemainingLeaveDays
);

// Route để lấy các leave request đang pending cho manager
router.get("/pending-requests/:managerId", getPendingLeaveRequestsForManager);

// Route để lấy lịch sử leave request của nhân viên
router.get("/history/employee/:employeeId", getLeaveRequestHistoryForEmployee);

// Route để lấy lịch sử leave request của manager
router.get("/history/manager/:managerId", getLeaveRequestHistoryForManager);

export default router;
