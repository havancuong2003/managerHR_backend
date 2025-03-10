import express from "express";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getEmployeesByDepartment,
} from "../controllers/department.controller.js";
const router = express.Router();

router.get("/", getDepartments);

router.post("/", createDepartment);

router.put("/:id", updateDepartment);

router.delete("/:id", deleteDepartment);

router.get("/employees/:id", getEmployeesByDepartment);

export default router;
