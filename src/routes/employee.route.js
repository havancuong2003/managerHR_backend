import express from "express";
import {
    getEmployees,
    getEmployeeById,
} from "../controllers/employee.controller.js";
import {
    authMiddleware,
    roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), getEmployees);
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(["employee"]),
    getEmployeeById
);
export default router;
