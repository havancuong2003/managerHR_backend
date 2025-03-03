import express from "express";
import { getEmployees } from "../controllers/employee.controller.js";

const router = express.Router();

router.get("/", getEmployees);

export default router;
