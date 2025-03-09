import express from "express";
import {
    addSalary,
    calculateTotalSalary,
    getDepartmentSalaryReport,
    getQuarterlySalaryReport,
    getSalaryByEmployeeId,
} from "../controllers/salary.controller.js";

const router = express.Router();

// Route để thêm salary cho nhân viên
router.post("/add", addSalary);

// Route để tính tổng lương cho nhân viên
router.post("/calculate", calculateTotalSalary);

// Route để lấy báo cáo lương của một department theo tháng
router.post("/department/report", getDepartmentSalaryReport);

// Route để lấy báo cáo lương theo quý của một department
router.post("/department/quarterly-report", getQuarterlySalaryReport);

// Route để lấy thông tin lương của một nhân viên theo employeeId
router.get("/employee/:employeeId", getSalaryByEmployeeId);

export default router;
