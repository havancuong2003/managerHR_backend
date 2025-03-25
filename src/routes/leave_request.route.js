import express from "express";
import {
    createLeaveRequest,
    updateLeaveRequest,
    getRemainingLeaveDays,
    getPendingLeaveRequestsForManager,
    getLeaveRequestHistoryForEmployee,
    getLeaveRequestHistoryForManager,
} from "../controllers/leave_request.controller.js";
import {
    authMiddleware,
    roleMiddleware,
    positionMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route để tạo leave request
router.post("/create", authMiddleware, createLeaveRequest);

// Route để cập nhật leave request
router.put(
    "/update",
    authMiddleware,
    positionMiddleware(["Manager"]),
    updateLeaveRequest
);

// Route để lấy số ngày nghỉ phép còn lại của nhân viên
router.post(
    "/remaining-leave-days/:employeeId",
    authMiddleware,
    getRemainingLeaveDays
);

// Route để lấy các leave request đang pending cho manager
router.get(
    "/pending-requests/:managerId",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getPendingLeaveRequestsForManager
);

// Route để lấy lịch sử leave request của nhân viên
router.get(
    "/history/employee/:employeeId",
    authMiddleware,
    getLeaveRequestHistoryForEmployee
);

// Route để lấy lịch sử leave request của manager
router.get(
    "/history/manager/:managerId",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getLeaveRequestHistoryForManager
);

export default router;
