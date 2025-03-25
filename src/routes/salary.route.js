import express from "express";
import {
    addSalary,
    calculateTotalSalary,
    getDepartmentSalaryReport,
    getQuarterlySalaryReport,
    getSalaryByEmployeeId,
} from "../controllers/salary.controller.js";
import {
    authMiddleware,
    roleMiddleware,
    positionMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

// Route để thêm salary cho nhân viên
router.post("/add", authMiddleware, positionMiddleware(["Manager"]), addSalary);

// Route để tính tổng lương cho nhân viên
router.post("/calculate", authMiddleware, calculateTotalSalary);

// Route để lấy báo cáo lương của một department theo tháng
router.post(
    "/department/report",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getDepartmentSalaryReport
);

// Route để lấy báo cáo lương theo quý của một department
router.post(
    "/department/quarterly-report",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getQuarterlySalaryReport
);

// Route để lấy thông tin lương của một nhân viên theo employeeId
router.get("/employee/:employeeId", authMiddleware, getSalaryByEmployeeId);

export default router;
