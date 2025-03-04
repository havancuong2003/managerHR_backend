import express from "express";
import { getEmployees } from "../controllers/employee.controller.js";
import {
    authMiddleware,
    roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin"]), getEmployees);

export default router;
