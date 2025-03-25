import express from "express";
import {
    addBonusSalary,
    getBonusSalaryForEmployee,
    getBonusSalaryForDepartment,
} from "../controllers/bonus_salary.controller.js";
import {
    authMiddleware,
    positionMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route để thêm bonus salary cho nhân viên
router.post(
    "/add",
    authMiddleware,
    positionMiddleware(["Manager"]),
    addBonusSalary
);

// Route để lấy bonus salary của một nhân viên theo employeeId
router.get("/employee/:employeeId", authMiddleware, getBonusSalaryForEmployee);

// Route để lấy bonus salary của các nhân viên trong một department theo tháng và năm
router.post(
    "/department/:departmentId",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getBonusSalaryForDepartment
);

export default router;
