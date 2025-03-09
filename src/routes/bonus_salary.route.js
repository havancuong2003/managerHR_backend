import express from "express";
import {
    addBonusSalary,
    getBonusSalaryForEmployee,
    getBonusSalaryForDepartment,
} from "../controllers/bonus_salary.controller";

const router = express.Router();

// Route để thêm bonus salary cho nhân viên
router.post("/add", addBonusSalary);

// Route để lấy bonus salary của một nhân viên theo employeeId
router.get("/employee/:employeeId", getBonusSalaryForEmployee);

// Route để lấy bonus salary của các nhân viên trong một department theo tháng và năm
router.post("/department", getBonusSalaryForDepartment);

export default router;
