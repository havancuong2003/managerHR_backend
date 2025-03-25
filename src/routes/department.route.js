import express from "express";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getEmployeesByDepartment,
} from "../controllers/department.controller.js";
import {
    authMiddleware,
    roleMiddleware,
    positionMiddleware,
} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), getDepartments);

router.post("/", authMiddleware, roleMiddleware(["admin"]), createDepartment);

router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateDepartment);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(["admin"]),
    deleteDepartment
);

router.get(
    "/employees/:id",
    authMiddleware,
    positionMiddleware(["Manager"]),
    getEmployeesByDepartment
);

export default router;
